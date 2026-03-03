import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  addAddress,
  allAddress,
  removeAddress,
  singleAddress,
} from "../controllers/address.js";

const addressRouter = express.Router();
addressRouter.post("/address/add", isAuth, addAddress);
addressRouter.get("/address/all", isAuth, allAddress);
addressRouter.get("/address/:id", isAuth, singleAddress);
addressRouter.delete("/address/:id", isAuth, removeAddress);

export default addressRouter;
