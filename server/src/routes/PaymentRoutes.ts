
import express from "express";
import {
  allCoupon,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
  verifyPayment,
} from "../controllers/PaymentController.js";
import { adminOnly, authenticate } from "../middlewares/auth.js";

const app = express.Router();

app.post("/create", createPaymentIntent);
app.post("/verify", verifyPayment);

app.post("/coupon/new",authenticate, adminOnly, newCoupon);
app.get("/discount", applyDiscount);
app.get("/coupon/all",authenticate, adminOnly, allCoupon);
app.delete("/coupon/:id",authenticate, adminOnly, deleteCoupon);

export default app;
