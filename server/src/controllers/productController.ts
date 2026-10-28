
import { NextFunction, Request, Response } from "express";
import {
  BaseQuery,
  NewProduct,
  Params,
  SearchReqQuery,
} from "../types/types.js";
import { Product } from "../modles/productModel.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/Revalidate.js";

export const newProduct = async (
  req: Request<{}, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, price, category, stock } = req.body;
    const photo = req.file;

    if (!photo) {
      return next(new Error("Upload a Photo"));
    }

    if (
      !name?.trim() ||
      price == null ||
      Number(price) <= 0 ||
      !category?.trim() ||
      stock == null ||
      Number(stock) < 0
    ) {
      rm(photo.path, () => {});
      return next(new Error("Invalid product fields"));
    }

    await Product.create({
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      category: category.trim().toLowerCase(),
      photo: photo.path,
    });

    await invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created",
    });
  } catch (error) {
    console.error("Create product error:", error);
    return next(error);
  }
};

export const GetLatestProduct = async (
  req: Request<{}, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    let product;

    if (myCache.has("latest-product")) {
      product = JSON.parse(myCache.get("latest-product") as string);
    } else {
      product = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      myCache.set("latest-product", JSON.stringify(product));
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GetLatestProduct error:", error);
    return next(error);
  }
};

export const getAllCategories = async (
  req: Request<{}, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    let categories;

    if (myCache.has("categories")) {
      categories = JSON.parse(myCache.get("categories") as string);
    } else {
      categories = await Product.distinct("category");
      myCache.set("categories", JSON.stringify(categories));
    }

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return next(error);
  }
};

export const getAdminProducts = async (
  req: Request<{}, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    let product;

    if (myCache.has("all-products")) {
      product = JSON.parse(myCache.get("all-products") as string);
    } else {
      product = await Product.find({});
      myCache.set("all-products", JSON.stringify(product));
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    return next(error);
  }
};

export const getSingleProduct = async (
  req: Request<Params, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new Error("No Product Found"));
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get single product error:", error);
    return next(error);
  }
};

export const updateProduct = async (
  req: Request<Params, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, price, category, stock } = req.body;
    const photo = req.file;
    const product = await Product.findById(req.params.id);

    if (!product) {
      if (photo) rm(photo.path, () => {});
      return next(new Error("No Product Found"));
    }

    if (photo) {
      rm(product.photo, () => {});
      product.photo = photo.path;
    }

    if (name?.trim()) product.name = name.trim();

    if (price != null && Number(price) > 0) {
      product.price = Number(price);
    }

    if (category?.trim()) {
      product.category = category.trim().toLowerCase();
    }

    if (stock != null && Number(stock) >= 0) {
      product.stock = Number(stock);
    }

    await product.save();
    await invalidateCache({ product: true, admin: true });

    return res.status(200).json({
      success: true,
      message: "Product Updated",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return next(error);
  }
};

export const deleteProduct = async (
  req: Request<Params, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new Error("No Product Found"));
    }

    await product.deleteOne();
    rm(product.photo, (error) => {
      if (error) console.error("Product photo deletion failed:", error);
    });

    await invalidateCache({ product: true, admin: true });

    return res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return next(error);
  }
};

export const getAllProducts = async (
  req: Request<{}, {}, {}, SearchReqQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery: BaseQuery = {};

    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      baseQuery.category = category;
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }

    const products = await Product.find(baseQuery)
      .limit(limit)
      .skip(skip)
      .sort(sort && { price: sort === "asc" ? 1 : -1 });

    const totalCount = await Product.countDocuments(baseQuery);
    const totalPage = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    return next(error);
  }
};
