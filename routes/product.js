import express from "express";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  fetchProductsAdmin,
  fetchSingleProduct,
  updateImage,
  updateProduct,
} from "../controllers/product.js";
import { isAuth } from "../middleware/isAuth.js";
import uploadmiddleware from "../middleware/uploadmiddleware.js";

const ProductRouter = express.Router();

ProductRouter.get("/product/all", fetchProducts);
ProductRouter.post("/product/create", isAuth, uploadmiddleware, createProduct);
ProductRouter.get("/product/admin/all", isAuth, fetchProductsAdmin);
ProductRouter.get("/product/:id", fetchSingleProduct);
ProductRouter.put("/product/:id", isAuth, updateProduct);
ProductRouter.post("/product/:id", isAuth,uploadmiddleware, updateImage);
ProductRouter.delete("/product/:id", isAuth, deleteProduct);

export default ProductRouter;
