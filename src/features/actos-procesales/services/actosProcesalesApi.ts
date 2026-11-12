import { baseApi } from "@/shared/services/baseApi";
import type {
  ActosProcesalesResponse,
  ListarActosProcesalesParams,
  ActoPorDocumentoData,
} from "../types/actoProcesal.types";

export const actosProcesalesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActosProcesales: builder.query<
      ActosProcesalesResponse,
      ListarActosProcesalesParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.n_unico) queryParams.n_unico = params.n_unico;
        if (params?.x_doc_id) queryParams.x_doc_id = params.x_doc_id;
        if (params?.fecha_inicio) queryParams.fecha_inicio = params.fecha_inicio;
        if (params?.fecha_fin) queryParams.fecha_fin = params.fecha_fin;
        if (params?.desde) queryParams.desde = params.desde;
        if (params?.hasta) queryParams.hasta = params.hasta;
        if (params?.f_ingreso_acto) queryParams.f_ingreso_acto = params.f_ingreso_acto;

        return {
          url: "/actos-procesales",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["ActoProcesal"],
    }),

    getActoPorDocumento: builder.query<ActoPorDocumentoData, string>({
      query: (docId) => ({
        url: "/actos-procesales/por-documento",
        params: { x_doc_id: docId.trim() },
      }),
      transformResponse: (response: unknown): ActoPorDocumentoData => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: ActoPorDocumentoData }).data;
        }
        return response as ActoPorDocumentoData;
      },
      providesTags: ["ActoProcesal"],
    }),

    buscarActoPorDocumento: builder.mutation<ActoPorDocumentoData, string>({
      query: (docId) => ({
        url: `/actos-procesales/por-documento?x_doc_id=${encodeURIComponent(docId.trim())}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): ActoPorDocumentoData => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: ActoPorDocumentoData }).data;
        }
        return response as ActoPorDocumentoData;
      },
    }),
  }),
});

export const {
  useGetActosProcesalesQuery,
  useGetActoPorDocumentoQuery,
  useLazyGetActoPorDocumentoQuery,
  useBuscarActoPorDocumentoMutation,
} = actosProcesalesApi;

