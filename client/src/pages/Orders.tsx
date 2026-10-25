import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import TableHOC from "../components/admin/TableHOC";
import { useMyOrdersQuery } from "../redux/api/OrderApi";
import { UserReducerType } from "../types/ReducerTypes";
import { CustomError } from "../types/Types";

type Datatype = {
  _id: string;
  amount: number;
  quantity: number;
  status: ReactElement;
  action: ReactElement;
};

const column: Column<Datatype>[] = [
  {
    Header: "ID",
    accessor: "_id",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Orders = () => {
  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );

  const { data, isError, error } = useMyOrdersQuery(user?._id!);

  const [rows, setRows] = useState<Datatype[]>([]);

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as CustomError)?.data?.message || "Unable to load orders"
      );
    }
  }, [isError, error]);

  useEffect(() => {
    if (data) {
      setRows(
        data.orders.map((order) => ({
          _id: order._id,
          amount: order.total,

          // Calculate actual total quantity across all products.
          quantity: order.orderItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),

          status: (
            <span
              className={
                order.status === "Processing"
                  ? "red"
                  : order.status === "Shipped"
                  ? "green"
                  : "purple"
              }
            >
              {order.status}
            </span>
          ),

          action: <Link to={`/order/${order._id}`}>View</Link>,
        }))
      );
    }
  }, [data]);

  const Table = TableHOC<Datatype>(
    column,
    rows,
    "dashboard-product-box",
    "Orders",
    rows.length > 6
  )();

  return (
    <div className="orders">
      <h1>MY ORDERS</h1>
      {Table}
    </div>
  );
};

export default Orders;