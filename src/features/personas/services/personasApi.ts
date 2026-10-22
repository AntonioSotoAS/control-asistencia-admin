import { baseApi } from "@/shared/services/baseApi";
import type {
  Persona,
  CrearPersonaPayload,
  ActualizarPersonaPayload,
} from "../types/persona.types";

export const personasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPersonas: builder.query<Persona[], string | void>({
      query: (q) => ({
        url: "/personas",
        params: q && q.trim() ? { q: q.trim() } : undefined,
      }),
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
      invalidatesTags: [{ type: "Persona", id: "LIST" }],
    }),

    actualizarPersona: builder.mutation<Persona, ActualizarPersonaPayload>({
      query: ({ id, ...body }) => ({
        url: `/personas/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Persona", id },
        { type: "Persona", id: "LIST" },
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
} = personasApi;
