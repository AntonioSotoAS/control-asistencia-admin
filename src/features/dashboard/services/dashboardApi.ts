import { baseApi } from "@/shared/services/baseApi";
import type {
  DashboardResumen,
  TendenciaAsistencia,
  ActividadReciente,
} from "../types/dashboard.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getResumen: builder.query<DashboardResumen, void>({
      query: () => "/dashboard/resumen",
      providesTags: ["Sesion", "Hito", "Persona"],
    }),
    getTendencia: builder.query<TendenciaAsistencia[], void>({
      query: () => "/dashboard/tendencia",
      providesTags: ["Sesion"],
    }),
    getActividadReciente: builder.query<ActividadReciente[], void>({
      query: () => "/dashboard/actividad-reciente",
      providesTags: ["Sesion"],
    }),
  }),
});

export const {
  useGetResumenQuery,
  useGetTendenciaQuery,
  useGetActividadRecienteQuery,
} = dashboardApi;
