
import { NextFunction, Request, Response } from "express";
import { CouponReqbody, OrderItemType, Params, paymentReqBody } from "../types/types.js";
import { Coupon } from "../modles/Coupon.js";
import { razorpay } from "../app.js";
import crypto from "crypto";
import { Order } from "../modles/OrderModel.js";
import { reduceStock } from "../utils/features.js";
import { invalidateCache } from "../utils/Revalidate.js";
import { Product } from "../modles/productModel.js";


export const newCoupon = async (
  req: Request<{}, {}, CouponReqbody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return next(new Error("code or amount is missing"));
    }

    await Coupon.create({
      code: code.trim().toUpperCase(),
      amount,
    });

    res.status(201).json({
      success: true,
      message: `coupon ${code} created Successfully`,
    });
  } catch (error) {
    return next(new Error("Error in newCoupon"));
  }
};

export const applyDiscount = async (
  req: Request<{}, {}, CouponReqbody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawCode = req.query.code;

    if (typeof rawCode !== "string" || !rawCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a coupon code",
      });
    }

    const code = rawCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    return res.status(200).json({
      success: true,
      discount: coupon.amount,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return next(new Error("Error applying coupon"));
  }
};


export const allCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await Coupon.find({});

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Fetch coupons error:", error);
    return next(new Error("Error fetching coupons"));
  }
};


export const deleteCoupon = async (
  req: Request<Params, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return next(new Error("Invalid coupon ID"));
    }

    res.status(200).json({
      success: true,
      message: "Coupon Deleted",
    });
  } catch (error) {
    return next(new Error("Error in deleteCoupon"));
  }
};

export const createPaymentIntent = async (
  req: Request<Params, {}, paymentReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};


export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingInfo,
      shippingCharges,
      orderItems,
      user,
      subtotal,
      tax,
      discount,
      total,
      couponCode,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !shippingInfo ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0 ||
      !user
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing order details",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Payment configuration is missing",
      });
    }

    // Verify Razorpay signature.
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (
      !/^[a-f0-9]{64}$/i.test(razorpay_signature) ||
      !crypto.timingSafeEqual(
        Buffer.from(razorpay_signature, "hex"),
        Buffer.from(expectedSignature, "hex")
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Confirm payment is captured and belongs to this Razorpay order.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.status !== "captured" ||
      payment.order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured",
      });
    }

    const existingOrder = await Order.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        orderId: existingOrder._id,
      });
    }

    // Recalculate prices using products stored in the database.
    let calculatedSubtotal = 0;
    const verifiedItems: OrderItemType[] = [];

    for (const item of orderItems) {
      const quantity = Number(item.quantity);

      if (
        !item.productId ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product || product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Product unavailable or insufficient stock",
        });
      }

      calculatedSubtotal += product.price * quantity;

      verifiedItems.push({
        name: product.name,
        photo: product.photo,
        price: product.price,
        quantity,
        productId: product._id.toString(),
      });
    }

    // Coupon amount is a percentage (for example, 80 means 80%).
    let calculatedDiscount = 0;

    if (Number(discount) > 0) {
      if (
        typeof couponCode !== "string" ||
        !couponCode.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Coupon code is required",
        });
      }

      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      calculatedDiscount = Math.round(
        calculatedSubtotal * (coupon.amount / 100)
      );
    }

    if (
      !Number.isFinite(Number(discount)) ||
      Number(discount) !== calculatedDiscount
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon discount amount is invalid",
      });
    }

    // Match CartReducer.ts: tax is calculated before discount.
    const calculatedShipping =
      calculatedSubtotal >= 500 ? 0 : 100;

    const calculatedTax = Math.round(
      calculatedSubtotal * 0.18
    );

    const calculatedTotal = Math.max(
      0,
      calculatedSubtotal +
        calculatedTax +
        calculatedShipping -
        calculatedDiscount
    );

    if (
      Number(subtotal) !== calculatedSubtotal ||
      Number(shippingCharges) !== calculatedShipping ||
      Number(tax) !== calculatedTax ||
      Number(total) !== calculatedTotal ||
      Number(payment.amount) !== Math.round(calculatedTotal * 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Order amount does not match verified products",
      });
    }

    const order = await Order.create({
      shippingInfo,
      shippingCharges: calculatedShipping,
      orderItems: verifiedItems,
      user,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      discount: calculatedDiscount,
      total: calculatedTotal,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await reduceStock(verifiedItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
    });

    return res.status(201).json({
      success: true,
      message: "Payment verified and order placed",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment and place order",
    });
  }
};