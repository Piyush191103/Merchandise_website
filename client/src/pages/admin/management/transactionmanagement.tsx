import { FaTrash } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Loader from "../../../components/admin/Loader";
import {
  useDeleteOrderMutation,
  useOrdersDetailsQuery,
  useProcessOrderMutation,
} from "../../../redux/api/OrderApi";
import { server } from "../../../redux/store";
import { UserReducerType } from "../../../types/ReducerTypes";
import { OrderItemType, OrderType } from "../../../types/Types";

const DefaultData: OrderType = {
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
  status: "",
  subtotal: 0,
  discount: 0,
  shippingCharges: 0,
  tax: 0,
  total: 0,
  orderItems: [],
  user: { name: "", _id: "" },
  _id: "",
};

const TransactionManagement = () => {
  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );

  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isError, isLoading } = useOrdersDetailsQuery(id!);
  const [updateOrder, { isLoading: isUpdating }] = useProcessOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  const order = data?.order || DefaultData;

  const {
    shippingInfo: { address, city, country, pinCode, state },
    orderItems,
    user: orderUser,
    status,
    shippingCharges,
    subtotal,
    tax,
    total,
    discount,
  } = order;

  const nextStatus =
    status === "Processing"
      ? "Shipped"
      : status === "Shipped"
      ? "Delivered"
      : null;

  const updateHandler = async () => {
    if (!order._id || !nextStatus) return;

    const res = await updateOrder({
      userId: user?._id!,
      orderId: order._id,
    });

    if ("data" in res) {
      toast.success(`Order status updated to ${res.data.status}`);
      navigate("/admin/transaction");
    } else {
      toast.error("Unable to update order status");
    }
  };

  const deleteHandler = async () => {
    if (!order._id) return;

    const res = await deleteOrder({
      userId: user?._id!,
      orderId: order._id,
    });

    if ("data" in res) {
      toast.success("Order deleted");
      navigate("/admin/transaction");
    } else {
      toast.error("Unable to delete order");
    }
  };

  if (isError) {
    navigate("/404");
    return null;
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      {isLoading ? (
        <Loader />
      ) : (
        <main className="product-management">
          <section style={{ padding: "2rem" }}>
            <h2>Order Items</h2>

            {orderItems.map((item) => (
              <ProductCard
                key={item._id}
                name={item.name}
                photo={`${server}/${item.photo}`}
                productId={item.productId}
                _id={item._id}
                quantity={item.quantity}
                price={item.price}
              />
            ))}
          </section>

          <article className="shipping-info-card">
            <button
              className="product-delete-btn"
              onClick={deleteHandler}
              disabled={isDeleting}
              title="Delete order"
            >
              <FaTrash />
            </button>

            <h1>Order Info</h1>

            <h5>User Info</h5>
            <p>Name: {orderUser.name}</p>
            <p>
              Address: {`${address}, ${city}, ${state}, ${country} ${pinCode}`}
            </p>

            <h5>Amount Info</h5>
            <p>Subtotal: ₹{subtotal}</p>
            <p>Shipping Charges: ₹{shippingCharges}</p>
            <p>Tax: ₹{tax}</p>
            <p>Discount: ₹{discount}</p>
            <p>
              <strong>Total: ₹{total}</strong>
            </p>

            <h5>Status Info</h5>
            <p>
              Status:{" "}
              <span
                className={
                  status === "Delivered"
                    ? "purple"
                    : status === "Shipped"
                    ? "green"
                    : "red"
                }
              >
                {status}
              </span>
            </p>

            {nextStatus ? (
              <button
                className="shipping-btn"
                onClick={updateHandler}
                disabled={isUpdating}
              >
                {isUpdating
                  ? "Updating..."
                  : `Mark as ${nextStatus}`}
              </button>
            ) : (
              <p>This order has been delivered.</p>
            )}

            <p style={{ marginTop: "1rem" }}>
              <Link to="/admin/transaction">← Back to Transactions</Link>
            </p>
          </article>
        </main>
      )}
    </div>
  );
};

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}: OrderItemType) => (
  <div className="transaction-product-card">
    <img src={photo} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} × {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;