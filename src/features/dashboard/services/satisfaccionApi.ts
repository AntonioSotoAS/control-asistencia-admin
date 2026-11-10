import { baseApi } from "@/shared/services/baseApi";
import type {
  ReporteSatisfaccionResponse,
  ReporteSatisfaccionParams,
  SatisfaccionListResponse,
} from "../types/satisfaccion.types";

export const satisfaccionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReporteSatisfaccion: builder.query<
      ReporteSatisfaccionResponse,
      ReporteSatisfaccionParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.persona_id) queryParams.persona_id = params.persona_id;
        if (params?.desde) queryParams.desde = params.desde;
        if (params?.hasta) queryParams.hasta = params.hasta;

        return {
          url: "/satisfaccion/reporte",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      transformResponse: (response: unknown): ReporteSatisfaccionResponse => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: ReporteSatisfaccionResponse }).data;
        }
        return (response as ReporteSatisfaccionResponse) || {};
      },
      providesTags: ["Satisfaccion"],
    }),

    getSatisfaccionList: builder.query<SatisfaccionListResponse, void>({
      query: () => "/satisfaccion",
      transformResponse: (response: unknown): SatisfaccionListResponse => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: SatisfaccionListResponse }).data;
        }
        return (response as SatisfaccionListResponse) || { promedio: null, total: 0, personas: [] };
      },
      providesTags: ["Satisfaccion"],
    }),
  }),
});

export const {
  useGetReporteSatisfaccionQuery,
  useGetSatisfaccionListQuery,
} = satisfaccionApi;
