
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { auth } from "../../firebase";
import {
  AllOrdersResponse,
  MessageResponse,
  NewOrderReqType,
  ProcessOrderReqType,
  ProcessOrderResType,
  SingleOrdersResponse,
} from "../../types/Types";

const getAuthToken = async (): Promise<string | null> => {
  const firebaseUser = auth.currentUser;

  if (firebaseUser) {
    return await firebaseUser.getIdToken();
  }

  return localStorage.getItem("authToken");
};

export const OrderApi = createApi({
  reducerPath: "OrderApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/order/`,
    prepareHeaders: async (headers) => {
      const token = await getAuthToken();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["orders"],

  endpoints: (builder) => ({
    NewOrder: builder.mutation<MessageResponse, NewOrderReqType>({
      query: (order) => ({
        url: "new",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["orders"],
    }),

    ProcessOrder: builder.mutation<ProcessOrderResType, ProcessOrderReqType>({
      query: ({ orderId }) => ({
        url: `${orderId}`,
        method: "PUT",
      }),
      invalidatesTags: ["orders"],
    }),

    DeleteOrder: builder.mutation<MessageResponse, ProcessOrderReqType>({
      query: ({ orderId }) => ({
        url: `${orderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orders"],
    }),

    myOrders: builder.query<AllOrdersResponse, string>({
      query: () => "my",
      providesTags: ["orders"],
    }),

    allOrders: builder.query<AllOrdersResponse, string>({
      query: () => "all",
      providesTags: ["orders"],
    }),

    ordersDetails: builder.query<SingleOrdersResponse, string>({
      query: (id) => `${id}`,
      providesTags: ["orders"],
    }),
  }),
});

export const {
  useNewOrderMutation,
  useAllOrdersQuery,
  useDeleteOrderMutation,
  useMyOrdersQuery,
  useOrdersDetailsQuery,
  useProcessOrderMutation,
} = OrderApi;
