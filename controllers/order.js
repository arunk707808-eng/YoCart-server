import { Cart } from "../models/cart.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { orderConfirmationHtml } from "../utils/orderConfirmationHtml.js";
import sendOrderConfirmation from "../utils/sendOrderConfirmation.js";
import Stripe from "stripe";

import tryCatch from "../utils/trycatch.js";

export const newOrderCash = tryCatch(async (req, res) => {
  const { method, phone, address } = req.body;
  const cart = await Cart.find({ user: req.user.id }).populate({
    path: "product",
    select: "title price",
  });

  if (!cart.length) return res.status(404).json({ message: "Cart is Empty" });
  let subTotal = 0;
  const items = cart.map((i) => {
    const itemTotal = i.product.price * i.quantity;
    subTotal += itemTotal;
    return {
      product: i.product._id,
      name: i.product.title,
      price: i.product.price,
      quantity: i.quantity,
    };
  });
  const order = await Order.create({
    items,
    method,
    user: req.user.id,
    phone,
    address,
    subTotal,
  });

  for (let i of order.items) {
    const product = await Product.findById(i.product);
    if (product) {
      product.stock -= i.quantity;
      product.sold += i.quantity;
      await product.save();
    }
  }
  await Cart.deleteMany({ user: req.user.id });
  // const user = await User.findById(req.user.id);
  // const subject = " Order Confirmation Mail";
  // const html = orderConfirmationHtml({
  //   email: user.email,
  //   products: items,
  //   orderId: order._id,
  //   totalAmount: subTotal,
  // });
  // await sendOrderConfirmation({
  //   email: user.email,
  //   subject,
  //   html,
  // });
  res.status(200).json({
    message: "order created",
    order,
  });
});

export const getAllOrders = tryCatch(async (req, res) => {
  const orders = await Order.find({ user: req.user.id });
  res.json({ orders: orders.reverse() });
});
export const getMyOrder = tryCatch(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id)
    .populate("items.product")
    .populate("user");
  if (!order) {
    return res.status(404).json({
      message: "there is no order with this id",
    });
  }
  res.json({
    order,
  });
});
export const getAllOrdersAdmin = tryCatch(async (req, res) => {
  let user = await User.findById(req.user.id);
  if (user.role !== "admin") {
    return res.status(403).json({
      message: "You are not allowed",
    });
  }
  const orders = await Order.find()
    .populate({ path: "user", select: "userName email role" })
    .sort({ createdAt: -1 });

  res.json({ orders });
});
export const updateStatus = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin") {
    return res.status(403).json({
      message: "You are not allowed",
    });
  }
  const order = await Order.findById(req.params.id);
  const { status } = req.body;
  order.status = status;
  await order.save();
  res.json({
    message: "Order status Updated",
    order,
  });
});
export const getStats = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin") {
    return res.status(403).json({
      message: "You are not allowed",
    });
  }
  const cod = await Order.find({ method: "cod" }).countDocuments();
  const online = await Order.find({ method: "online" }).countDocuments();
  const products = await Product.find();
  const data = products.map((prod) => ({
    name: prod.title,
    sold: prod.sold,
  }));
  res.json({
    cod,
    online,
    data,
  });
});

import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.Stripe_Secret_Key);

export const newOrderOnline = async (req, res) => {
  try {
    const { method, address, phone } = req.body;
    const cart = await Cart.find({ user: req.user.id }).populate("product");
    if (cart.length === 0) {
      return res.status(404).json({
        message: "cart is empty",
      });
    }
    const subTotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    const lineItems = cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.title,
          images: [item.product.images[0].url],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.Frontend_Url}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Frontend_Url}/cart`,
      metadata: {
        userId: req.user._id.toString(),
        method,
        phone,
        address,
        subTotal,
      },
    });
    res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.log("error creating stripe session:", error.message);
    res.status(500).json({
      message: "Failed to create payment session",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const { userId, method, phone, address, subTotal } = session.metadata;
    const cart = await Cart.find({ user: userId }).populate("product");
    if (cart.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }
    const item = cart.map((i) => {
      return {
        product: i.product._id,
        name: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
      };
    });
    let order = await Order.findOne({ paymentInfo: sessionId });
    if (!order) {
      order = await Order.create({
        items: cart.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
        })),
        method,
        user: userId,
        phone,
        address,
        subTotal,
        paidAt: new Date(),
        paymentInfo: sessionId,
      });
    }
    for (let i of order.items) {
      const product = await Product.findById(i.product);
      if (product) {
        product.stock -= i.quantity;
        product.sold += i.quantity;
        await product.save();
      }
    }
    await Cart.deleteMany({ user: req.user.id });
    // const user = await User.findById(req.user.id);
    // const subject = " Order Confirmation";
    // const html = orderConfirmationHtml({
    //   email: user.email,
    //   products: order.items,
    //   orderId: order._id,
    //   totalAmount: subTotal,
    // });
   
    // await sendOrderConfirmation({
    //   email: user.email,
    //   subject,
    //   html,
    // });
    res.status(200).json({
      message: "order created",
      order,
    });
  } catch (error) {
    console.log("error occure in verify payment:", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};
