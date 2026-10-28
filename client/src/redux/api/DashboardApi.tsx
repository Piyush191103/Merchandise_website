
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { auth } from "../../firebase";
import {
  BarResType,
  PieResType,
  StatsResType,
  lineResType,
} from "../../types/Types";

const getAuthToken = async (): Promise<string | null> => {
  const firebaseUser = auth.currentUser;

  if (firebaseUser) {
    return await firebaseUser.getIdToken();
  }

  return localStorage.getItem("authToken");
};

export const DashboardApi = createApi({
  reducerPath: "DashboardApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/dashboard/`,

    prepareHeaders: async (headers) => {
      const token = await getAuthToken();

      console.log("DASHBOARD TOKEN EXISTS:", Boolean(token));

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: [],

  endpoints: (builder) => ({
    stats: builder.query<StatsResType, string>({
      query: (id) => `stats?id=${id}`,
      keepUnusedDataFor: 0,
    }),

    pie: builder.query<PieResType, string>({
      query: (id) => `pie?id=${id}`,
      keepUnusedDataFor: 0,
    }),

    bar: builder.query<BarResType, string>({
      query: (id) => `bar?id=${id}`,
      keepUnusedDataFor: 0,
    }),

    line: builder.query<lineResType, string>({
      query: (id) => `line?id=${id}`,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useBarQuery,
  useLineQuery,
  usePieQuery,
  useStatsQuery,
} = DashboardApi;
