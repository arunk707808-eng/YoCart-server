import express from "express";
import {
  addToCart,
  fetchCart,
  removeFromCart,
  updateCart,
} from "../controllers/cart.js";
import { isAuth } from "../middleware/isAuth.js";

const cartRouter = express.Router();
cartRouter.post("/cart/add", isAuth, addToCart);
cartRouter.get("/cart/remove/:id", isAuth, removeFromCart);
cartRouter.post("/cart/update", isAuth, updateCart);
cartRouter.get("/cart/fetch", isAuth, fetchCart);
export default cartRouter;
