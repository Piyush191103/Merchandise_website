import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMyOrdersQuery } from "../redux/api/OrderApi";
import { UserReducerType } from "../types/ReducerTypes";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );

  const { data, isLoading, isError } = useMyOrdersQuery(user?._id!);

  if (isLoading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  const order = data?.orders.find((item) => item._id === id);

  if (isError || !order) {
    return <div style={{ textAlign: "center", padding: 40 }}>
      <h2>Order not found</h2>
      <Link to="/orders">← Back to Orders</Link>
    </div>;
  }

  return (
    <div style={{
      maxWidth: 800,
      margin: "50px auto",
      padding: 25,
      background: "#f4f8ff",
      borderRadius: 16,
      color: "#24324d",
    }}>
      <div style={{
        background: "linear-gradient(120deg, #299bc9, #536bd8)",
        color: "white",
        padding: 25,
        borderRadius: 12,
        marginBottom: 20,
      }}>
        <h1 style={{ margin: 0 }}>Order Details</h1>
        <p>Order ID: {order._id}</p>
        <span style={{
          background: "white",
          color: "#298fc7",
          padding: "6px 12px",
          borderRadius: 20,
          fontWeight: "bold",
        }}>
          {order.status}
        </span>
      </div>

      <div style={{ background: "white", padding: 20, borderRadius: 12 }}>
        <h2>🛍️ Products</h2>

        {order.orderItems.map((item, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            borderBottom: "1px solid #e5eaf2",
            padding: "12px 0",
          }}>
            <div>
              <strong>{item.name}</strong>
              <p style={{ margin: "6px 0", color: "#77849a" }}>
                Quantity: {item.quantity}
              </p>
            </div>
            <strong>₹{item.price * item.quantity}</strong>
          </div>
        ))}

        <h2 style={{ color: "#168b68" }}>
          Total: ₹{order.total.toLocaleString("en-IN")}
        </h2>
      </div>

      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        marginTop: 18,
      }}>
        <h2>📍 Shipping Address</h2>
        <p>{order.shippingInfo.address}</p>
        <p>
          {order.shippingInfo.city}, {order.shippingInfo.state}
        </p>
        <p>
          {order.shippingInfo.country} - {order.shippingInfo.pinCode}
        </p>
      </div>

      <Link
        to="/orders"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "12px 20px",
          background: "#299bc9",
          color: "white",
          textDecoration: "none",
          borderRadius: 8,
          fontWeight: "bold",
        }}
      >
        ← Back to My Orders
      </Link>
    </div>
  );
};

export default OrderDetails;