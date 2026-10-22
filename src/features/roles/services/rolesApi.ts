import { baseApi } from "@/shared/services/baseApi";
import type {
  Rol,
  CrearRolPayload,
  ActualizarRolPayload,
} from "../types/rol.types";

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Rol[], void>({
      query: () => "/roles",
      transformResponse: (response: unknown): Rol[] => {
        if (Array.isArray(response)) {
          return response as Rol[];
        }
        if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) {
            return d as Rol[];
          }
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Rol" as const, id })),
              { type: "Rol", id: "LIST" },
            ]
          : [{ type: "Rol", id: "LIST" }],
    }),

    getRolById: builder.query<Rol, number>({
      query: (id) => `/roles/${id}`,
      transformResponse: (response: unknown): Rol => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: Rol }).data;
        }
        return response as Rol;
      },
      providesTags: (_result, _error, id) => [{ type: "Rol", id }],
    }),

    crearRol: builder.mutation<Rol, CrearRolPayload>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body: {
          codigo: body.codigo.toLowerCase().trim(),
          nombre: body.nombre.trim(),
        },
      }),
      invalidatesTags: [{ type: "Rol", id: "LIST" }],
    }),

    actualizarRol: builder.mutation<Rol, ActualizarRolPayload>({
      query: ({ id, ...body }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: {
          ...(body.codigo ? { codigo: body.codigo.toLowerCase().trim() } : {}),
          nombre: body.nombre.trim(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Rol", id },
        { type: "Rol", id: "LIST" },
      ],
    }),

    eliminarRol: builder.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Rol", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRolByIdQuery,
  useCrearRolMutation,
  useActualizarRolMutation,
  useEliminarRolMutation,
} = rolesApi;
