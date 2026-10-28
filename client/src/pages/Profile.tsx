
import { useSelector } from "react-redux";
import { FaUser, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import { UserReducerType } from "../types/ReducerTypes";

const Profile = () => {
  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );

  if (!user) return <h2>Please login first</h2>;

  return (
    <div style={{
      maxWidth: "650px",
      margin: "50px auto",
      padding: "30px",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 4px 20px #0001",
      fontFamily: "Arial"
    }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "#eee",
          margin: "auto",
          display: "grid",
          placeItems: "center",
          overflow: "hidden"
        }}>
          {user.photo
            ? <img src={user.photo} alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <FaUser size={35} />}
        </div>

        <h1>{user.name}</h1>
        <span style={{
          background: user.role === "admin" ? "#eee5ff" : "#e5f7eb",
          padding: "7px 14px",
          borderRadius: "20px",
          color: "#333"
        }}>
          <FaShieldAlt /> {user.role === "admin" ? "Admin" : "Customer"}
        </span>
      </div>

      <hr />

      <p><FaUser /> <b>Name:</b> {user.name}</p>
      <p><FaEnvelope /> <b>Email:</b> {user.email}</p>
      <p><FaShieldAlt /> <b>Role:</b> {user.role}</p>

      <div style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "25px"
      }}>
        <a href="/orders" style={buttonStyle}>My Orders</a>

        {user.role === "admin" && (
          <a href="/admin/dashboard" style={buttonStyle}>
            Admin Dashboard
          </a>
        )}
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  background: "#111",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: "8px",
  textDecoration: "none"
};

export default Profile;
