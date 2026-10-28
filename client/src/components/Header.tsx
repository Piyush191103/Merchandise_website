
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
  const [isOpen, setIsOpen] = useState(false);

  const { CartItems } = useSelector(
    (state: { CartReducer: CartReducerInitialState }) =>
      state.CartReducer
  );

  const cartCount = CartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Temporary debugging: check the user received by Header.
  console.log("HEADER USER:", user);

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

      <Link
        onClick={() => setIsOpen(false)}
        to="/search"
        aria-label="Search products"
      >
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
        <div style={{ position: "relative", display: "inline-flex" }}>
          <button
            type="button"
            aria-label="Open user menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <FaUserAlt />
          </button>

          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                minWidth: "170px",
                padding: "16px",
                marginTop: "10px",
                backgroundColor: "#fff",
                color: "#111",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>

              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
              >
                Orders
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              <button
                type="button"
                onClick={logoutHandler}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" aria-label="Login">
          <FaSignInAlt />
        </Link>
      )}
    </nav>
  );
};

export default Header;
