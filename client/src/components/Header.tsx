import { signOut } from "firebase/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaSignInAlt, FaSignOutAlt, FaUserAlt } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { UserType } from "../types/Types";
import { useDispatch } from "react-redux";
import { userNotExist } from "../redux/reducer/UserReducer";



type HeaderProptype={
  user:UserType |null;

}
const Header = ({user}:HeaderProptype) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
const logoutHandler = async () => {
  try {
    await signOut(auth);

    // Remove the email/password JWT
    localStorage.removeItem("authToken");

    // Clear the Redux user for both login methods
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
      <Link onClick={() => setIsOpen(false)} to={"/"}>
        Home
      </Link>
      <Link onClick={() => setIsOpen(false)} to={"/search"}>
        <FaSearch />
      </Link>
      <Link onClick={() => setIsOpen(false)} to={"/cart"}>
        <FaCartShopping />
      </Link>

      {user?._id ? (
        <>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            <FaUserAlt />
          </button>
          <dialog open={isOpen}>
            <div>
              {user.role === "admin" ? (
                <Link onClick={() => setIsOpen(false)} to={"/admin/dashboard"}>
                  Admin
                </Link>
              ) : (
                <></>
              )}
              <Link onClick={() => setIsOpen(false)} to={"/orders"}>
                Orders
              </Link>
              <button onClick={logoutHandler}>
                <FaSignOutAlt />
              </button>
            </div>
          </dialog>
        </>
      ) : (
        <Link to={"/login"}>
          <FaSignInAlt />
        </Link>
      )}
    </nav>
  );
};

export default Header;








