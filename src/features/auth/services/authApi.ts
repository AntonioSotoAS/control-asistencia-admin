import { baseApi } from "@/shared/services/baseApi";
import type {
  LoginRequest,
  LoginResponse,
  PerfilPersona,
  HealthResponse,
  ConsentimientoPayload,
} from "../types/auth.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkHealth: builder.query<HealthResponse, void>({
      query: () => "/health",
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Usuario"],
    }),

    logout: builder.mutation<{ message?: string; mensaje?: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: [
        "Usuario",
        "Sesion",
        "Hito",
        "Persona",
        "Rol",
        "Justificacion",
      ],
    }),

    getPerfil: builder.query<PerfilPersona, void>({
      query: () => "/perfil",
      transformResponse: (response: unknown): PerfilPersona => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: PerfilPersona }).data;
        }
        return response as PerfilPersona;
      },
      providesTags: ["Usuario"],
    }),

    registrarConsentimiento: builder.mutation<
      { message?: string; mensaje?: string },
      ConsentimientoPayload | void
    >({
      query: (body) => ({
        url: "/consentimiento",
        method: "POST",
        body: body || { consentimiento: true },
      }),
      invalidatesTags: ["Usuario"],
    }),
  }),
});

export const {
  useCheckHealthQuery,
  useLoginMutation,
  useLogoutMutation,
  useGetPerfilQuery,
  useRegistrarConsentimientoMutation,
} = authApi;
