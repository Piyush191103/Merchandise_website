
import { NextFunction, Request, Response } from "express";
import { User } from "../modles/userModel.js";
import { NewUserRequestBody, Params } from "../types/types.js";
import { invalidateCache } from "../utils/Revalidate.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

export const newUser = async (
  req: Request<{}, {}, NewUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, photo, gender, _id, dob } = req.body;
    let user = await User.findById(_id);
    if (user) {
      return res.status(200).json({
        success: true,
        message: `Welcome back ${user.name}`,
      });
    }

    if (!name || !email || !photo || !_id ) {
      return next(new Error("Please Fill all fields"));
    }
    
    user = await User.create({
      name,
      email,
      photo,
     _id,
      role:"user",
      ...(gender ? { gender } : {}),
      ...(dob ? { dob } : {}),
    });

    await invalidateCache({ admin: true });

    res.status(201).json({
      success: true,
      message: `Welcome ${user.name}`,
    });
  } catch (error) {
    return next(new Error("Meri error"));
  }
};

export const getAllUsers = async (
  req: Request<{}, {}, NewUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({});
    // console.log(users);
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return next(new Error("Error in getAllUser"));
  }
};

export const getUser = async (
  req: Request<Params, {}, NewUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "NO USER FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new Error("Error in getUser"));
  }
};

export const deleteUser = async (
  req: Request<Params, {}, NewUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "NO USER FOUND",
      });
    }
    await user.deleteOne();
    await invalidateCache({ admin: true });

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return next(new Error("Error in getUser"));
  }
};

export const emailSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, gender, dob } = req.body;

    if (!name || !email || !password || !gender || !dob) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please sign in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = `email_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const user = await User.create({
      _id: id,
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      photo: "https://placehold.co/200x200?text=User",
      role: "user",
      gender,
      dob: new Date(dob),
    });

    await invalidateCache({ admin: true });

    return res.status(201).json({
      success: true,
      message: `Welcome ${user.name}`,
      token: createToken(String(user._id)),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        gender: user.gender,
        dob: user.dob,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const emailSignin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.name}`,
      token: createToken(String(user._id)),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        gender: user.gender,
        dob: user.dob,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const verifySession = async (
  req: Request,
  res: Response
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing",
      });
    }

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (typeof decoded.userId !== "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        gender: user.gender,
        dob: user.dob,
      },
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid",
    });
  }
};
