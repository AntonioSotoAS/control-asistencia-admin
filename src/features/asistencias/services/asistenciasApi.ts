import { baseApi } from "@/shared/services/baseApi";
import type { Asistencia, RegistroAsistenciaPayload } from "../types/asistencia.types";

export const asistenciasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAsistencias: builder.query<Asistencia[], { hitoId?: string | number; fecha?: string } | void>({
      query: (params) => ({
        url: "/asistencias",
        params: params || undefined,
      }),
      providesTags: ["Sesion"],
    }),
    registrarAsistencia: builder.mutation<Asistencia, RegistroAsistenciaPayload>({
      query: (body) => ({
        url: "/asistencias/marcar",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sesion"],
    }),
  }),
});

export const {
  useGetAsistenciasQuery,
  useRegistrarAsistenciaMutation,
} = asistenciasApi;
