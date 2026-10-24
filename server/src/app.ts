import express from "express";
import { config } from "dotenv";
import { connectDB } from "./utils/dataBase.js";
import { ErrorMiddleWare } from "./middlewares/ErrorMiddleWare.js";
import userRoute from "./routes/UserRouter.js";
import ProductRoute from "./routes/ProductRoutes.js";
import OrderRoute from "./routes/OrderRoutes.js";
import PaymentRoute from "./routes/PaymentRoutes.js";
import DashboardRoute from "./routes/StatsRoutes.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";

config();



const port = process.env.PORT || 4000;
const stripeKey = process.env.STRIPE_KEY || "";


const app = express();
app.use(express.json());
app.use(morgan("dev"));
console.log("Mongo URI loaded:", !!process.env.MONGO_URI);
connectDB();
app.use(
  cors()
);
export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", ProductRoute);
app.use("/api/v1/order", OrderRoute);
app.use("/api/v1/payment", PaymentRoute);
app.use("/api/v1/dashboard", DashboardRoute);



app.get("/", (req, res) => {
  res.send("akram bakram");
});

app.use("/Uploads", express.static("Uploads"));
app.use(ErrorMiddleWare);

app.listen(port, () => {
  console.log(`Port is started on localhost:${port}`);
});
