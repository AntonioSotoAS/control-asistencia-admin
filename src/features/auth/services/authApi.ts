import { baseApi } from "@/shared/services/baseApi";
import type { LoginRequest, LoginResponse } from "../types/auth.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Usuario"],
    }),

    getPerfil: builder.query<unknown, void>({
      query: () => "/perfil",
      providesTags: ["Usuario"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetPerfilQuery,
} = authApi;
