
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import { auth } from "../../firebase";
import {
  AllUserMessageResponse,
  DeleteUserReq,
  MessageResponse,
  UserResponse,
  UserType,
} from "../../types/Types";

export type EmailSignupRequest = {
  name: string;
  email: string;
  password: string;
  gender: "male" | "female";
  dob: string;
};

export type EmailSigninRequest = {
  email: string;
  password: string;
};

export type EmailAuthResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "user" | "admin";
    gender: "male" | "female";
    dob: string;
  };
};

const getAuthToken = async (): Promise<string | null> => {
  // Firebase login
  const firebaseUser = auth.currentUser;

  if (firebaseUser) {
    return await firebaseUser.getIdToken();
  }

  // Email/password login
  return localStorage.getItem("authToken");
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/user/`,
    prepareHeaders: async (headers) => {
      const token = await getAuthToken();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["users"],
  endpoints: (builder) => ({
    login: builder.mutation<MessageResponse, UserType>({
      query: (user) => ({
        url: "new",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),

    emailSignup: builder.mutation<EmailAuthResponse, EmailSignupRequest>({
      query: (user) => ({
        url: "signup",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),

    emailSignin: builder.mutation<EmailAuthResponse, EmailSigninRequest>({
      query: (user) => ({
        url: "signin",
        method: "POST",
        body: user,
      }),
    }),

    getAllUser: builder.query<AllUserMessageResponse, string>({
      query: () => "all",
      providesTags: ["users"],
    }),

    deleteUser: builder.mutation<MessageResponse, DeleteUserReq>({
      query: ({ userId }) => ({
        url: `${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const getUser = async (id: string) => {
  const token = await getAuthToken();

  const { data }: { data: UserResponse } = await axios.get(
    `${import.meta.env.VITE_SERVER}/api/v1/user/${id}`,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  return data;
};

export const {
  useLoginMutation,
  useEmailSignupMutation,
  useEmailSigninMutation,
  useDeleteUserMutation,
  useGetAllUserQuery,
} = userApi;
