
import { NextFunction, Request, Response } from "express";
import { Params, NewOrderReqBody } from "../types/types.js";
import { Order } from "../modles/OrderModel.js";
import { invalidateCache } from "../utils/Revalidate.js";
import { myCache } from "../app.js";

type AuthRequest = Request<Params, {}, NewOrderReqBody> & {
  authenticatedUserId?: string;
};

// Orders must be created through the verified Razorpay payment flow.
export const NewOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  return res.status(410).json({
    success: false,
    message: "Please place orders through the payment checkout flow.",
  });
};

export const myOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.authenticatedUserId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const orders = await Order.find({ user: userId }).sort({ _id: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const allOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let orders;

    if (myCache.has("all-orders")) {
      orders = JSON.parse(myCache.get("all-orders") as string);
    } else {
      orders = await Order.find().populate("user", "name email");
      myCache.set("all-orders", JSON.stringify(orders));
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.authenticatedUserId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const orderOwnerId = String(
    (order.user as unknown as { _id?: unknown })?._id ?? order.user
    );

    const requester = await import("../modles/userModel.js").then(
      ({ User }) => User.findById(userId).select("role")
    );

    if (
      orderOwnerId !== userId &&
      requester?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const processOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "Processing") {
      order.status = "Shipped";
    } else if (order.status === "Shipped") {
      order.status = "Delivered";
    } else {
      return res.status(400).json({
        success: false,
        message: "This order has already been delivered",
      });
    }

    await order.save();
    await invalidateCache({
      product: false,
      order: true,
      admin: true,
    });

    return res.status(200).json({
      success: true,
      status: order.status,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    await invalidateCache({
      product: false,
      order: true,
      admin: true,
    });

    return res.status(200).json({
      success: true,
      message: "Order deleted",
    });
  } catch (error) {
    next(error);
  }
};
