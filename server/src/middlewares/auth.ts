
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import { User } from "../modles/userModel.js";

declare global {
  namespace Express {
    interface Request {
      authenticatedUserId?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = header.slice(7);
    console.log("AUTH HEADER RECEIVED:", Boolean(header));
    console.log("TOKEN RECEIVED:", Boolean(token));
    console.log("AUTH MIDDLEWARE HIT");
    console.log("JWT SECRET EXISTS:", Boolean(process.env.JWT_SECRET));
    console.log(
     "FIREBASE APPS:",
      (await import("firebase-admin/app")).getApps().length
    );
    let userId: string | undefined;

    // First try the application's JWT.
    const secret = process.env.JWT_SECRET;

    if (secret) {
      try {
        const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

        if (typeof decoded.userId === "string") {
          userId = decoded.userId;
        }
      } catch {
        // It may be a Firebase ID token. Try Firebase verification below.
      }
    }

    // If it wasn't our JWT, verify it as a Firebase ID token.
    if (!userId) {
  try {
    const decoded = await getAuth().verifyIdToken(token);
    userId = decoded.uid;
  } catch (error) {
    console.error("Firebase token verification failed:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}

    const user = await User.findById(userId).select("_id");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.authenticatedUserId = String(user._id);
    next();
  } catch (error) {
    next(error);
  }
};

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.authenticatedUserId).select("role");

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
