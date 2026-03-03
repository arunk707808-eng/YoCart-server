import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  getAllOrders,
  getAllOrdersAdmin,
  getMyOrder,
  getStats,
  newOrderCash,
  newOrderOnline,
  updateStatus,
  verifyPayment,
} from "../controllers/order.js";

const orderRouter = express.Router();
orderRouter.post("/order/new/cash",isAuth,  newOrderCash);
orderRouter.get("/order/all", isAuth, getAllOrders);
orderRouter.get("/order/admin/all", isAuth, getAllOrdersAdmin);
orderRouter.get("/order/:id", isAuth, getMyOrder);
orderRouter.post("/order/:id", isAuth, updateStatus);
orderRouter.get("/stats", isAuth, getStats);
orderRouter.post("/order/new/online", isAuth, newOrderOnline);
orderRouter.post("/order/verify/payment", isAuth, verifyPayment); 

export default orderRouter;
