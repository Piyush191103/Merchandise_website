import express from "express";

import {
  authenticate,
  adminOnly,
} from "../middlewares/auth.js";

import {
  NewOrder,
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  processOrder,
} from "../controllers/OrderController.js";

const app = express.Router();

// Logged-in users only
app.post("/new", authenticate, NewOrder);
app.get("/my", authenticate, myOrders);

// Admin only
app.get("/all", authenticate, adminOnly, allOrders);
app.put("/:id", authenticate, adminOnly, processOrder);
app.delete("/:id", authenticate, adminOnly, deleteOrder);

// Logged-in user: controller must verify ownership or admin role
app.get("/:id", authenticate, getSingleOrder);

export default app;