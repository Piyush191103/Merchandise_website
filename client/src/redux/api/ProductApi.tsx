
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { auth } from "../../firebase";

import {
  CategoriesResType,
  DeleteProductReqType,
  MessageResponse,
  NewProductReqType,
  ProductDetailRes,
  ProductResType,
  SearchProductReqType,
  SearchProductResType,
  UpdateProductReqType,
  UpdateProductRes,
} from "../../types/Types";

const getAuthToken = async (): Promise<string | null> => {
  const firebaseUser = auth.currentUser;

  if (firebaseUser) {
    return await firebaseUser.getIdToken();
  }

  return localStorage.getItem("authToken");
};

export const ProductApi = createApi({
  reducerPath: "ProductApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/product/`,

    prepareHeaders: async (headers) => {
      const token = await getAuthToken();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["product"],

  endpoints: (builder) => ({
    latestProducts: builder.query<ProductResType, string>({
      query: () => "latest",
      providesTags: ["product"],
    }),

    allProducts: builder.query<ProductResType, string>({
      query: (id) => `admin-products?id=${id}`,
      providesTags: ["product"],
    }),

    categories: builder.query<CategoriesResType, string>({
      query: () => "categories",
      providesTags: ["product"],
    }),

    Searchedproducts: builder.query<
      SearchProductResType,
      SearchProductReqType
    >({
      query: ({ search, sort, category, page, price }) => {
        let base = `all?search=${encodeURIComponent(search)}&page=${page}`;

        if (category) {
          base += `&category=${encodeURIComponent(category)}`;
        }

        if (sort) {
          base += `&sort=${encodeURIComponent(sort)}`;
        }

        if (price) {
          base += `&price=${encodeURIComponent(String(price))}`;
        }

        return base;
      },
      providesTags: ["product"],
    }),

    productDetail: builder.query<ProductDetailRes, string>({
      query: (id) => id,
      providesTags: ["product"],
    }),

    NewProduct: builder.mutation<MessageResponse, NewProductReqType>({
      query: ({ formData, id }) => ({
        url: `new?id=${encodeURIComponent(id)}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["product"],
    }),

    updateProduct: builder.mutation<UpdateProductRes, UpdateProductReqType>({
      query: ({ formData, userId, productId }) => ({
        url: `${productId}?id=${encodeURIComponent(userId)}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["product"],
    }),

    deleteProduct: builder.mutation<MessageResponse, DeleteProductReqType>({
      query: ({ userId, productId }) => ({
        url: `${productId}?id=${encodeURIComponent(userId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product"],
    }),
  }),
});

export const {
  useLatestProductsQuery,
  useAllProductsQuery,
  useCategoriesQuery,
  useSearchedproductsQuery,
  useNewProductMutation,
  useProductDetailQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} = ProductApi;
