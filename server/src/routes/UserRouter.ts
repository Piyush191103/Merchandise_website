
import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
  emailSignup,
  emailSignin,
  verifySession,
} from "../controllers/userController.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// Google login / existing user registration
app.post("/new", newUser);

// Normal email/password signup
app.post("/signup", emailSignup);

// Normal email/password signin
app.post("/signin", emailSignin);

// verify session
app.get("/session", verifySession);

// Get all users (admin only)
app.get("/all", authenticate, adminOnly, getAllUsers);

// Get a single user
app.get("/:id", authenticate, getUser);

// Delete user (admin only)
app.delete("/:id",authenticate, adminOnly, deleteUser);

export default app;
