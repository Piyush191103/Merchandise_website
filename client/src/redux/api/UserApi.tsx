
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
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

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/user/`,
  }),
  tagTypes: ["users"],
  endpoints: (builder) => ({
    // Existing Google login — keep this
    login: builder.mutation<MessageResponse, UserType>({
      query: (user) => ({
        url: "new",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),

    // Normal email/password signup
    emailSignup: builder.mutation<EmailAuthResponse, EmailSignupRequest>({
      query: (user) => ({
        url: "signup",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),

    // Normal email/password signin
    emailSignin: builder.mutation<EmailAuthResponse, EmailSigninRequest>({
      query: (user) => ({
        url: "signin",
        method: "POST",
        body: user,
      }),
    }),

    getAllUser: builder.query<AllUserMessageResponse, string>({
      query: (id) => `all?id=${id}`,
      providesTags: ["users"],
    }),

    deleteUser: builder.mutation<MessageResponse, DeleteUserReq>({
      query: ({ userId, adminId }) => ({
        url: `${userId}?id=${adminId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const getUser = async (id: string) => {
  const { data }: { data: UserResponse } = await axios.get(
    `${import.meta.env.VITE_SERVER}/api/v1/user/${id}`
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
