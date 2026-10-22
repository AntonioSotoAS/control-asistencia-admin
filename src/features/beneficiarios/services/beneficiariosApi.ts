import { baseApi } from "@/shared/services/baseApi";
import type { Beneficiario, BeneficiarioFilterParams } from "../types/beneficiario.types";

export const beneficiariosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBeneficiarios: builder.query<Beneficiario[], BeneficiarioFilterParams | void>({
      query: (params) => ({
        url: "/beneficiarios",
        params: params || undefined,
      }),
      providesTags: ["Persona"],
    }),
    getBeneficiarioById: builder.query<Beneficiario, string | number>({
      query: (id) => `/beneficiarios/${id}`,
      providesTags: ["Persona"],
    }),
    crearBeneficiario: builder.mutation<Beneficiario, Partial<Beneficiario>>({
      query: (body) => ({
        url: "/beneficiarios",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Persona"],
    }),
    actualizarBeneficiario: builder.mutation<
      Beneficiario,
      { id: string | number; data: Partial<Beneficiario> }
    >({
      query: ({ id, data }) => ({
        url: `/beneficiarios/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Persona"],
    }),
  }),
});

export const {
  useGetBeneficiariosQuery,
  useGetBeneficiarioByIdQuery,
  useCrearBeneficiarioMutation,
  useActualizarBeneficiarioMutation,
} = beneficiariosApi;
