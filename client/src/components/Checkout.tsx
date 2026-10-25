
import axios from "axios";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate} from "react-router-dom";
import { resetCart } from "../redux/reducer/CartReducer";
import { server } from "../redux/store";
import {
  CartReducerInitialState,
  UserReducerType,
} from "../types/ReducerTypes";
import { NewOrderReqType } from "../types/Types";

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );

  const {
    shippingInfo,
    CartItems,
    subtotal,
    tax,
    discount,
    total,
    shippingCharges,
  } = useSelector(
    (state: { CartReducer: CartReducerInitialState }) => state.CartReducer
  );

  const SubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing) return;

    if (!user?._id || !CartItems.length || !shippingInfo) {
      toast.error("Please check your login, cart and shipping details");
      navigate("/cart");
      return;
    }

    if (total <= 0) {
      toast.error("Invalid order amount");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay Checkout did not load. Refresh the page.");
      return;
    }

    setIsProcessing(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/payment/create`,
        { amount: total }
      );

      if (!data.success || !data.orderId || !data.key) {
        throw new Error("Unable to create Razorpay order");
      }

      const orderData: NewOrderReqType = {
        shippingInfo,
        shippingCharges,
        orderItems: CartItems,
        subtotal,
        tax,
        discount,
        total,
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
            await axios.post(`${server}/api/v1/payment/verify`, {
              ...orderData,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            localStorage.removeItem("myCart");
            dispatch(resetCart());
            toast.success("Order placed successfully");
            navigate("/orders");
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error(
              "Payment verification failed. Please contact support before retrying."
            );
          } finally {
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast("Payment cancelled");
          },
        },

        theme: {
          color: "#3399cc",
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Unable to start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <form onSubmit={SubmitHandler}>
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "PAY"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
