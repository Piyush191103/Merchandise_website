
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CartReducerInitialState } from "../../types/ReducerTypes";
import {
  CartItemType,
  ShippingInfoType,
} from "../../types/Types";

const getCartData = () => {
  const localCartData = localStorage.getItem("myCart");

  if (!localCartData) {
    return [];
  }

  try {
    return JSON.parse(localCartData);
  } catch {
    return [];
  }
};

const initialState: CartReducerInitialState = {
  loading: false,
  CartItems: getCartData(),
  subtotal: 0,
  shippingCharges: 0,
  discount: 0,
  tax: 0,
  total: 0,
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
};

export const CartReducer = createSlice({
  name: "CartReducer",
  initialState,

  reducers: {
    addToCart: (state, action: PayloadAction<CartItemType>) => {
      const index = state.CartItems.findIndex(
        (item) =>
          item.productId === action.payload.productId
      );

      if (index !== -1) {
        state.CartItems[index] = action.payload;
      } else {
        state.CartItems.push(action.payload);
      }
    },

    removeFromCart: (
      state,
      action: PayloadAction<string>
    ) => {
      state.CartItems = state.CartItems.filter(
        (item) => item.productId !== action.payload
      );

      if (state.CartItems.length === 0) {
        state.discount = 0;
      }
    },

    calculatePrice: (state) => {
      const subtotal = state.CartItems.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );

      state.subtotal = subtotal;

      if (state.CartItems.length === 0) {
        state.subtotal = 0;
        state.shippingCharges = 0;
        state.tax = 0;
        state.discount = 0;
        state.total = 0;
        return;
      }

      // Free shipping for orders of ₹500 or more.
      state.shippingCharges =
        subtotal >= 500 ? 0 : 100;

      state.tax = Math.round(subtotal * 0.18);

      state.total = Math.max(
        0,
        subtotal +
          state.tax +
          state.shippingCharges -
          state.discount
      );
    },

    
    discountApplied: (
      state,
      action: PayloadAction<number>
    ) => {
      state.discount = action.payload;

      state.total = Math.max(
        0,
        state.subtotal +
        state.tax +
        state.shippingCharges -
        state.discount
      );
    },


    saveShippingInfo: (
      state,
      action: PayloadAction<ShippingInfoType>
    ) => {
      state.shippingInfo = action.payload;
    },

    resetCart: () => initialState,
  },
});

export const {
  addToCart,
  removeFromCart,
  calculatePrice,
  discountApplied,
  saveShippingInfo,
  resetCart,
} = CartReducer.actions;
