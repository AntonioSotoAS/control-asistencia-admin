import { baseApi } from "@/shared/services/baseApi";
import type { Hito } from "../types/hito.types";

export const hitosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHitos: builder.query<Hito[], void>({
      query: () => "/hitos",
      providesTags: ["Hito"],
    }),
    getHitoById: builder.query<Hito, string | number>({
      query: (id) => `/hitos/${id}`,
      providesTags: ["Hito"],
    }),
    crearHito: builder.mutation<Hito, Partial<Hito>>({
      query: (body) => ({
        url: "/hitos",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Hito"],
    }),
    actualizarHito: builder.mutation<
      Hito,
      { id: string | number; data: Partial<Hito> }
    >({
      query: ({ id, data }) => ({
        url: `/hitos/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Hito"],
    }),
  }),
});

export const {
  useGetHitosQuery,
  useGetHitoByIdQuery,
  useCrearHitoMutation,
  useActualizarHitoMutation,
} = hitosApi;
