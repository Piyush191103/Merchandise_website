
import express from "express";

import { authenticate, adminOnly } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

import {
  GetLatestProduct,
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controllers/productController.js";

const app = express.Router();

// Public product browsing
app.get("/latest", GetLatestProduct);
app.get("/categories", getAllCategories);
app.get("/all", getAllProducts);

// Admin product management
app.get("/admin-products", authenticate, adminOnly, getAdminProducts);
app.post("/new", authenticate, adminOnly, singleUpload, newProduct);
app.put("/:id", authenticate, adminOnly, singleUpload, updateProduct);
app.delete("/:id", authenticate, adminOnly, deleteProduct);

// Keep dynamic ID route last
app.get("/:id", getSingleProduct);

export default app;
