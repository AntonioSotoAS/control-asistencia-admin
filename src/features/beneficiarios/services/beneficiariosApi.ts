import { baseApi } from "@/shared/services/baseApi";
import type {
  Beneficiario,
  BeneficiarioFilterParams,
} from "../types/beneficiario.types";

export const beneficiariosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBeneficiarios: builder.query<Beneficiario[], BeneficiarioFilterParams | void>({
      query: (params) => {
        if (!params) {
          return { url: "/beneficiarios" };
        }

        const queryParams: Record<string, string> = {};
        if (params.q?.trim()) {
          queryParams.q = params.q.trim();
        }
        if (params.seguimiento && params.seguimiento !== "TODOS") {
          queryParams.seguimiento = params.seguimiento;
        }
        if (params.estado && params.estado !== "TODOS") {
          queryParams.estado = params.estado;
        }

        return {
          url: "/beneficiarios",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      transformResponse: (response: unknown): Beneficiario[] => {
        if (Array.isArray(response)) {
          return response as Beneficiario[];
        }
        if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) {
            return d as Beneficiario[];
          }
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Persona" as const, id })),
            { type: "Persona", id: "BENEFICIARIOS_LIST" },
          ]
          : [{ type: "Persona", id: "BENEFICIARIOS_LIST" }],
    }),

    getBeneficiarioById: builder.query<Beneficiario, string | number>({
      query: (id) => `/beneficiarios/${id}`,
      transformResponse: (response: unknown): Beneficiario => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: Beneficiario }).data;
        }
        return response as Beneficiario;
      },
      providesTags: (_result, _error, id) => [{ type: "Persona", id }],
    }),
  }),
});

export const {
  useGetBeneficiariosQuery,
  useGetBeneficiarioByIdQuery,
} = beneficiariosApi;
