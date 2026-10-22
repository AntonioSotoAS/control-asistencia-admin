import { baseApi } from "@/shared/services/baseApi";
import type { ReporteItem, ReporteFiltrosState } from "../types/reporte.types";

export const reportesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReporteConsolidado: builder.query<ReporteItem[], ReporteFiltrosState | void>({
      query: (params) => ({
        url: "/reportes/consolidado",
        params: params || undefined,
      }),
      providesTags: ["Sesion"],
    }),
  }),
});

export const { useGetReporteConsolidadoQuery } = reportesApi;
