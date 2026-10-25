
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import {
  addToCart,
  calculatePrice,
  discountApplied,
  removeFromCart,
} from "../redux/reducer/CartReducer";
import { server } from "../redux/store";
import { CartReducerInitialState } from "../types/ReducerTypes";
import { CartItemType } from "../types/Types";

const Cart = () => {
  const {
    CartItems,
    discount,
    tax,
    total,
    shippingCharges,
    subtotal,
  } = useSelector(
    (state: { CartReducer: CartReducerInitialState }) =>
      state.CartReducer
  );

  const dispatch = useDispatch();

  const [couponCode, setCouponcode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const incrementCartHandler = (cartItem: CartItemType) => {
    if (cartItem.quantity >= cartItem.stock) {
      toast.error("Order Limit Reached");
      return;
    }

    dispatch(
      addToCart({
        ...cartItem,
        quantity: cartItem.quantity + 1,
      })
    );
  };

  const decrementCartHandler = (cartItem: CartItemType) => {
    if (cartItem.quantity <= 1) return;

    dispatch(
      addToCart({
        ...cartItem,
        quantity: cartItem.quantity - 1,
      })
    );
  };

  const removeCartHandler = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  // Recalculate cart totals when products change.
  useEffect(() => {
    dispatch(calculatePrice());
  }, [CartItems, dispatch]);

  // Save cart to local storage.
  useEffect(() => {
    localStorage.setItem("myCart", JSON.stringify(CartItems));
  }, [CartItems]);

  // Validate coupon and calculate percentage discount.
  useEffect(() => {
    const code = couponCode.trim();

    if (!code || CartItems.length === 0) {
      setIsValid(false);
      setCouponMessage("");
      dispatch(discountApplied(0));
      return;
    }

    let isActive = true;

    const { token: cancelToken, cancel } =
      axios.CancelToken.source();

    const timeOutID = setTimeout(() => {
      axios
        .get(
          `${server}/api/v1/payment/discount?code=${encodeURIComponent(
            code
          )}`,
          { cancelToken }
        )
        .then((res) => {
          if (!isActive) return;

          const percentage = Number(res.data.discount);

          if (
            !Number.isFinite(percentage) ||
            percentage < 1 ||
            percentage > 100
          ) {
            setIsValid(false);
            setCouponMessage("Invalid coupon");
            dispatch(discountApplied(0));
            return;
          }

          const discountAmount = Math.round(
            (subtotal * percentage) / 100
          );

          setIsValid(true);
          setCouponMessage("");
          dispatch(discountApplied(discountAmount));
        })
        .catch((error) => {
          if (!isActive || axios.isCancel(error)) return;

          setIsValid(false);
          setCouponMessage("Invalid coupon code");
          dispatch(discountApplied(0));
        });
    }, 700);

    return () => {
      isActive = false;
      clearTimeout(timeOutID);
      cancel();
    };
  }, [couponCode, CartItems.length, subtotal, dispatch]);

  return (
    <div className="cart">
      <main>
        {CartItems.length > 0 ? (
          CartItems.map((item) => (
            <CartItem
              incrementCartHandler={incrementCartHandler}
              removeCartHandler={removeCartHandler}
              decrementCartHandler={decrementCartHandler}
              key={item.productId}
              cartItem={item}
            />
          ))
        ) : (
          <h1>No Items Added</h1>
        )}
      </main>

      <aside>
        {CartItems.length > 0 ? (
          <>
            <p>SubTotal: ₹{subtotal}</p>

            <p>
              Shipping Charges:{" "}
              {subtotal >= 500 ? (
                <>
                  <s>₹100</s> ₹0
                </>
              ) : (
                `₹${shippingCharges}`
              )}
            </p>

            {subtotal >= 500 && (
              <p style={{ color: "green", fontSize: "14px" }}>
                Free shipping! Shipping charges apply on orders below ₹499.
              </p>
            )}

            <p>Tax: ₹{tax}</p>

            <p>
              Discount:{" "}
              <em className="red">- ₹{discount}</em>
            </p>

            <p>
              <b>Total: ₹{total}</b>
            </p>

            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponcode(e.target.value)}
            />

            {couponCode.trim() && (
              isValid ? (
                <span className="green">
                  {couponCode.trim().toUpperCase()} applied: ₹{discount} off
                </span>
              ) : couponMessage ? (
                <span className="red">
                  {couponMessage} <VscError />
                </span>
              ) : null
            )}

            <Link
              to="/shipping"
              state={{ couponCode: isValid ? couponCode.trim().toUpperCase() : "" }}
            >
              Checkout
            </Link>
          </>
        ) : (
          <p>
            <b>Total: ₹0</b>
          </p>
        )}
      </aside>
    </div>
  );
};

export default Cart;
