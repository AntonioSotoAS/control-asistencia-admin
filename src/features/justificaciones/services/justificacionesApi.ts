import { baseApi } from "@/shared/services/baseApi";
import type { Justificacion, ResponderJustificacionPayload } from "../types/justificacion.types";

export const justificacionesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJustificaciones: builder.query<Justificacion[], void>({
      query: () => "/justificaciones",
      providesTags: ["Sesion"],
    }),
    responderJustificacion: builder.mutation<Justificacion, ResponderJustificacionPayload>({
      query: ({ id, ...body }) => ({
        url: `/justificaciones/${id}/responder`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Sesion"],
    }),
  }),
});

export const {
  useGetJustificacionesQuery,
  useResponderJustificacionMutation,
} = justificacionesApi;
