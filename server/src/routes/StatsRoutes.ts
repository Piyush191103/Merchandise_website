
import express from "express";
import { authenticate, adminOnly } from "../middlewares/auth.js";
import {
  getBarCharts,
  getDashBoardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/StatsController.js";

const app = express.Router();

// Verify login first, then check admin role.
app.use(authenticate, adminOnly);

app.get("/stats", getDashBoardStats);
app.get("/pie", getPieCharts);
app.get("/bar", getBarCharts);
app.get("/line", getLineCharts);

export default app;
