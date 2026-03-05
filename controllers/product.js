import { deleteFromCloud, uploadOnCloud } from "../config/cloudinary.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import tryCatch from "../utils/trycatch.js";

export const fetchProducts = tryCatch(async (req, res) => {
  const { search, category, page, sortByPrice } = req.query;
  const filter = { isDeleted:false };

  if (search) {
filter.$text = {$search:search}    //text index use
}
 
  if (category) {
    filter.category = category;
  }
  let sortOption = {
    createdAt: -1,
  };
  if (sortByPrice === "lowToHigh") {
    sortOption = { price: 1 };
  } else if (sortByPrice === "highToLow") {
    sortOption = { price: -1 };
  }

  const countProduct = await Product.countDocuments(filter);
  const limit = 12;
  const skip = (page - 1) * limit;

  const totalPages = Math.ceil(countProduct / limit);
  const product = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const categories = await Product.distinct("category");
  const letestProducts = await Product.find().sort({ createdAt: -1 }).limit(4);
  const mostSoldProduct = await Product.find().sort({ sold: -1 }).limit(4);

  res
    .status(200)
    .json({ totalPages, product, categories, letestProducts, mostSoldProduct });
});

export const createProduct = tryCatch(async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });
  if (!user || user.role !== "admin") {
    return res.status(400).json({
      message: "You are not allowed",
    });
  }
  const { title, description, category, price, stock } = req.body;
  const files = req.files;
  if (!files || files.length === 0)
    return res.status(400).json({
      message: "Please give image",
    });
  const images = await uploadOnCloud(files);
  const product = await Product.create({
    title,
    description,
    category,
    price,
    stock,
    images: images,
  });
  res.status(201).json({
    message: "Product Created",
    product,
  });
});

export const fetchProductsAdmin = tryCatch(async (req, res) => {
  const products = await Product.find();
  if (!products) {
    return res.status(404).json({
      message: "products not found",
    });
  }
  res.status(200).json({
    products,
  });
});

export const fetchSingleProduct = tryCatch(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  const reletedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
 
  res.status(200).json({
    product,
    reletedProducts,
  });
});

export const deleteProduct = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin") {
    return res.status(400).json({
      message: "You are not allowed",
    });
  }

  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({
      message: "product not found",
    });
  }
  await deleteFromCloud(product.images);
  res.status(200).json({
    message: "deleted successfully",
  });
});

export const updateProduct = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin") {
    return res.status(400).json({
      message: "You are not allowed",
    });
  }
  const { title, description, category, price, stock } = req.body;
  const updateField = {};
  if (title) updateField.title = title;
  if (description) updateField.description = description;
  if (category) updateField.category = category;
  if (price) updateField.price = price;
  if (stock) updateField.stock = stock;
  const product = await Product.findByIdAndUpdate(req.params.id, updateField, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return res.status(404).json({
      message: "product not found",
    });
  }
  res.status(200).json({
    message: "updated successfully",
    product,
  });
});

export const updateImage = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin") {
    return res.status(400).json({
      message: "You are not allowed",
    });
  }
  const { id } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({
      message: "Please give image",
    });
  }
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      message: "product not found",
    });
  }
  const oldImages = product.images || [];
  if (oldImages) {
    await deleteFromCloud(oldImages);
  }
  const newImages = await uploadOnCloud(files);
  product.images = newImages;
  product.save();
  res.status(200).json({
    message: "image updated",
    product,
  });
});
