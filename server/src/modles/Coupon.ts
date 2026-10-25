import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please enter a coupon"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Please enter a discount percentage"],
    min: 1,
    max: 100,
  },
});

export const Coupon = mongoose.model("Coupon", couponSchema);
