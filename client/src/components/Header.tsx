
import { signOut } from "firebase/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserAlt,
} from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { UserType } from "../types/Types";
import { userNotExist } from "../redux/reducer/UserReducer";
import { CartReducerInitialState } from "../types/ReducerTypes";

type HeaderProptype = {
  user: UserType | null;
};

const Header = ({ user }: HeaderProptype) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { CartItems } = useSelector(
    (state: { CartReducer: CartReducerInitialState }) =>
      state.CartReducer
  );

  // Total quantity across all cart products.
  const cartCount = CartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      dispatch(userNotExist());
      setIsOpen(false);
      toast.success("Signed Out");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Sign Out Failed");
    }
  };

  return (
    <nav className="header">
      <Link onClick={() => setIsOpen(false)} to="/">
        Home
      </Link>

      <Link onClick={() => setIsOpen(false)} to="/search">
        <FaSearch />
      </Link>

      <Link
        onClick={() => setIsOpen(false)}
        to="/cart"
        aria-label={`Shopping cart, ${cartCount} items`}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <FaCartShopping />

        {cartCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-10px",
              right: "-12px",
              backgroundColor: "#e53935",
              color: "#fff",
              borderRadius: "50%",
              minWidth: "19px",
              height: "19px",
              padding: "0 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "bold",
              boxSizing: "border-box",
            }}
          >
            {cartCount}
          </span>
        )}
      </Link>

      {user?._id ? (
        <>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            <FaUserAlt />
          </button>

          <dialog open={isOpen}>
            <div>
              {user.role === "admin" && (
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/admin/dashboard"
                >
                  Admin
                </Link>
              )}

              <Link
                onClick={() => setIsOpen(false)}
                to="/orders"
              >
                Orders
              </Link>

              <button onClick={logoutHandler}>
                <FaSignOutAlt />
              </button>
            </div>
          </dialog>
        </>
      ) : (
        <Link to="/login">
          <FaSignInAlt />
        </Link>
      )}
    </nav>
  );
};

export default Header;
