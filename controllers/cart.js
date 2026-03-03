import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import tryCatch from "../utils/trycatch.js";

export const addToCart = tryCatch(async (req, res) => {
  const { product } = req.body;
  const cart = await Cart.findOne({
    product: product,
    user: req.user.id,
  }).populate("product");
  
  if (cart) {
    if (cart.quantity === cart.product.stock) {
      return res.status(400).json({
        message: "Out of Stock",
      });
    }
       cart.quantity = cart.quantity + 1;
    cart.save();
    
  }else{
const cartPro = await Product.findById(product);
  if (cartPro.stock === 0) {
    return res.status(400).json({
      message: "Out of Stock",
    });
  }

  await Cart.create({
    quantity: 1,
    product,
    user:req.user.id,
  });
  }
  

  res.status(201).json({
    message: "Added in Cart",
  });
});

export const removeFromCart = tryCatch(async (req, res) => {
  const cart = await Cart.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: "Remove from Cart",
  });
});

export const updateCart = tryCatch(async (req, res) => {
  const { action } = req.query;
  if(action ==="inc"){
    const {id} = req.body;
    const cart =await Cart.findById(id).populate("product")
    if(cart.quantity < cart.product.stock){
      cart.quantity++;
      cart.save()
    }else{
      return res.status(400).json({
        message:"Out of Stock"
      })
    }
    res.status(200).json({
      message:"Cart updated"
    })

  }
  if(action === "dec"){
    const {id} = req.body;
    const cart = await Cart.findById(id).populate("product")
    if(cart.quantity > 1){
      cart.quantity--
      cart.save()
    }else{
      return res.status(400).json({
        message:"You have only one Product in cart"
      })
    }
    res.status(200).json({
      message:"Cart updated"
    })
  }
 
});

export const fetchCart = tryCatch(async (req, res) => {
  const cart = await Cart.find({ user: req.user.id }).populate("product")
  const sumOfQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  let subTotal = 0;
  cart.forEach((i) => {
    const itemSubtotal = i.product.price * i.quantity;
    subTotal = subTotal + itemSubtotal;
  });
  res.status(200).json({
    cart,
    subTotal,
    sumOfQuantity,
  });
});
