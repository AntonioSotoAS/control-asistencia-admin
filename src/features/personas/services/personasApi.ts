import { baseApi } from "@/shared/services/baseApi";
import type {
  Persona,
  CrearPersonaPayload,
  ActualizarPersonaPayload,
  RegistrarPersonaYCuentaPayload,
} from "../types/persona.types";

export const personasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPersonas: builder.query<Persona[], { q?: string; rol?: string } | string | void>({
      query: (arg) => {
        const params: Record<string, string> = {};
        if (typeof arg === "string" && arg.trim()) {
          params.q = arg.trim();
        } else if (arg && typeof arg === "object") {
          if (arg.q && arg.q.trim()) params.q = arg.q.trim();
          if (arg.rol && arg.rol !== "TODOS" && arg.rol.trim()) params.rol = arg.rol.trim();
        }
        return {
          url: "/personas",
          params: Object.keys(params).length > 0 ? params : undefined,
        };
      },
      transformResponse: (response: unknown): Persona[] => {
        if (Array.isArray(response)) {
          return response as Persona[];
        }
        if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) {
            return d as Persona[];
          }
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Persona" as const, id })),
            { type: "Persona", id: "LIST" },
          ]
          : [{ type: "Persona", id: "LIST" }],
    }),

    getPersonaById: builder.query<Persona, number>({
      query: (id) => `/personas/${id}`,
      transformResponse: (response: unknown): Persona => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: Persona }).data;
        }
        return response as Persona;
      },
      providesTags: (_result, _error, id) => [{ type: "Persona", id }],
    }),

    crearPersona: builder.mutation<Persona, CrearPersonaPayload>({
      query: (body) => ({
        url: "/personas",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): Persona => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: Persona }).data;
        }
        return response as Persona;
      },
      invalidatesTags: [{ type: "Persona", id: "LIST" }],
    }),

    actualizarPersona: builder.mutation<Persona, ActualizarPersonaPayload>({
      query: ({ id, ...body }) => ({
        url: `/personas/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown): Persona => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: Persona }).data;
        }
        return response as Persona;
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Persona", id },
        { type: "Persona", id: "LIST" },
      ],
    }),

    registrarPersonaYCuenta: builder.mutation<
      { persona: Persona; usuario?: unknown },
      RegistrarPersonaYCuentaPayload
    >({
      query: (body) => ({
        url: "/registros",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): { persona: Persona; usuario?: unknown } => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: { persona: Persona; usuario?: unknown } }).data;
        }
        return response as { persona: Persona; usuario?: unknown };
      },
      invalidatesTags: [
        { type: "Persona", id: "LIST" },
        { type: "Usuario", id: "LIST" },
      ],
    }),

    eliminarPersona: builder.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: `/personas/${id}`,
        method: "DELETE",
      }),
      // Eliminar persona también afecta su usuario y sesiones según el backend
      invalidatesTags: [
        { type: "Persona", id: "LIST" },
        { type: "Usuario", id: "LIST" },
        { type: "Sesion", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPersonasQuery,
  useGetPersonaByIdQuery,
  useCrearPersonaMutation,
  useActualizarPersonaMutation,
  useEliminarPersonaMutation,
  useRegistrarPersonaYCuentaMutation,
} = personasApi;
