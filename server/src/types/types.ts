import { NextFunction, Request, Response } from "express";

export type NewUserRequestBody = {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "user" | "admin";
  gender: "male" | "female";
  dob: Date;
  //Virtual Attribute
  age: number;
};
export type EmailSignupRequestBody = {
  name: string;
  email: string;
  password: string;
  gender: "male" | "female";
  dob: Date;
};

export type NewProduct = {
  name: string;
  stock: number;
  price: number;
  category: string;
};

export type Params = {
  id: string;
};

export const ControllerType = (
  req: Request<{}, {}, NewUserRequestBody>,
  res: Response,
  next: NextFunction
) => Promise<void | Response<AnalyserNode, Record<string, any>>>;

export type SearchReqQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export type BaseQuery = {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: {
    $lte: Number;
  };
  category?: string;
};

export type invalidateCacheType = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
};

export type OrderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};

export type shippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
};

export type NewOrderReqBody = {
  shippingInfo: shippingInfoType;
  user: string;
  subtotal: string;
  total: number;
  tax: number;
  discount: number;
  shippingCharges: number;
  orderItems: OrderItemType[];
};



export type CouponReqbody = {
  code:string;
  amount:number;
};


export type paymentReqBody = {
  amount: number;
};
