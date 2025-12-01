import express from "express";
import {
  verifyRazorpay,
  placeOrder,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const orderRouter = express.Router();

orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post("/razorpay", userAuth, placeOrderRazorpay);

orderRouter.post("/userorders", userAuth, userOrders);

orderRouter.post("/verifyRazorpay", userAuth, verifyRazorpay);

export default orderRouter;
