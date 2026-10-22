import { baseApi } from "@/shared/services/baseApi";
import type {
  Usuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from "../types/usuario.types";

export const usuariosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsuarios: builder.query<Usuario[], string | void>({
      query: (q) => ({
        url: "/usuarios",
        params: q && q.trim() ? { q: q.trim() } : undefined,
      }),
      transformResponse: (response: unknown): Usuario[] => {
        if (Array.isArray(response)) {
          return response as Usuario[];
        }
        if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) {
            return d as Usuario[];
          }
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Usuario" as const, id })),
            { type: "Usuario", id: "LIST" },
          ]
          : [{ type: "Usuario", id: "LIST" }],
    }),

    getUsuarioById: builder.query<Usuario, number>({
      query: (id) => `/usuarios/${id}`,
      transformResponse: (response: unknown): Usuario => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: Usuario }).data;
        }
        return response as Usuario;
      },
      providesTags: (_result, _error, id) => [{ type: "Usuario", id }],
    }),

    crearUsuario: builder.mutation<Usuario, CrearUsuarioPayload>({
      query: (body) => ({
        url: "/usuarios",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Usuario", id: "LIST" }],
    }),

    actualizarUsuario: builder.mutation<Usuario, ActualizarUsuarioPayload>({
      query: ({ id, ...body }) => ({
        url: `/usuarios/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Usuario", id },
        { type: "Usuario", id: "LIST" },
      ],
    }),

    eliminarUsuario: builder.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: `/usuarios/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Usuario", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUsuariosQuery,
  useGetUsuarioByIdQuery,
  useCrearUsuarioMutation,
  useActualizarUsuarioMutation,
  useEliminarUsuarioMutation,
} = usuariosApi;
