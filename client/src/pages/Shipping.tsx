import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  resetCart,
  saveShippingInfo,
} from "../redux/reducer/CartReducer";
import { server } from "../redux/store";
import {
  CartReducerInitialState,
  UserReducerType,
} from "../types/ReducerTypes";
import { ShippingInfoType } from "../types/Types";

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void | Promise<void>;
      modal?: {
        ondismiss?: () => void;
      };
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      theme?: {
        color?: string;
      };
    }) => {
      open: () => void;
    };
  }
}

const Shipping = () => {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfoType>({
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const {
    CartItems,
    subtotal,
    tax,
    discount,
    total,
    shippingCharges,
  } = useSelector(
    (state: { CartReducer: CartReducerInitialState }) => state.CartReducer
  );

  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const couponCode =
    (location.state as { couponCode?: string } | null)?.couponCode ?? "";

  useEffect(() => {
    if (CartItems.length < 1) {
      navigate("/cart");
    }
  }, [CartItems, navigate]);

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing) return;

    if (!user?._id || CartItems.length === 0) {
      toast.error("Please log in and check your cart");
      return;
    }

    if (total <= 0) {
      toast.error("Invalid order amount");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay Checkout did not load. Please refresh the page.");
      return;
    }

    setIsProcessing(true);
    dispatch(saveShippingInfo(shippingInfo));

    try {
      const { data } = await axios.post(
        `${server}/api/v1/payment/create`,
        { amount: total }
      );

      if (!data.success || !data.orderId || !data.key) {
        throw new Error(data.message || "Could not create payment order");
      }

      const orderData = {
        shippingInfo,
        shippingCharges,
        orderItems: CartItems,
        subtotal,
        tax,
        discount,
        total,
        couponCode,
        user: user._id,
      };

      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Venera",
        description: "Merchandise order payment",
        order_id: data.orderId,

        handler: async (response) => {
          try {
            const result = await axios.post(
              `${server}/api/v1/payment/verify`,
              {
                ...orderData,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (!result.data.success) {
              throw new Error(
                result.data.message || "Payment verification failed"
              );
            }

            localStorage.removeItem("myCart");
            dispatch(resetCart());

            toast.success("Order placed successfully");
            navigate("/orders");
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(
                "Payment verification failed:",
                error.response?.status,
                error.response?.data || error.message
              );
              toast.error(
                error.response?.data?.message ||
                  "Payment succeeded, but order confirmation failed. Do not pay again."
              );
            } else {
              console.error("Payment verification failed:", error);
              toast.error(
                "Payment may have succeeded, but order confirmation failed. Do not pay again."
              );
            }
          } finally {
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast("Payment window closed");
          },
        },

        theme: { color: "#3399cc" },
      });

      razorpay.open();
    } catch (error) {
      console.error("Checkout error:", error);

      if (axios.isAxiosError(error)) {
        console.error("Checkout response:", error.response?.data);
      }

      toast.error("Unable to start checkout. Please check the backend logs.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="shipping">
      <button type="button" onClick={() => navigate("/cart")}>
        <IoChevronBackCircleSharp />
      </button>

      <form className="shipping-form" onSubmit={submitHandler}>
        <h1>
          SHIPPING <br />
          ADDRESS
        </h1>

        <input
          required
          type="text"
          placeholder="Address"
          name="address"
          value={shippingInfo.address}
          onChange={changeHandler}
        />

        <input
          required
          type="text"
          placeholder="City"
          name="city"
          value={shippingInfo.city}
          onChange={changeHandler}
        />

        <input
          required
          type="text"
          placeholder="State"
          name="state"
          value={shippingInfo.state}
          onChange={changeHandler}
        />

        <select
          name="country"
          required
          value={shippingInfo.country}
          onChange={changeHandler}
        >
          <option value="">Choose Country</option>
          <option value="india">India</option>
        </select>

        <input
          required
          type="number"
          placeholder="Pin Code"
          name="pinCode"
          value={shippingInfo.pinCode}
          onChange={changeHandler}
        />

        <button type="submit" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "PAY NOW"}
        </button>
      </form>
    </div>
  );
};

export default Shipping;