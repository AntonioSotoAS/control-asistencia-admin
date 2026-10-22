import { baseApi } from "@/shared/services/baseApi";
import type { Usuario } from "../types/usuario.types";

export const usuariosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsuarios: builder.query<Usuario[], void>({
      query: () => "/usuarios",
      providesTags: ["Usuario"],
    }),
    crearUsuario: builder.mutation<Usuario, Partial<Usuario> & { password?: string }>({
      query: (body) => ({
        url: "/usuarios",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Usuario"],
    }),
    actualizarUsuario: builder.mutation<
      Usuario,
      { id: string | number; data: Partial<Usuario> }
    >({
      query: ({ id, data }) => ({
        url: `/usuarios/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Usuario"],
    }),
  }),
});

export const {
  useGetUsuariosQuery,
  useCrearUsuarioMutation,
  useActualizarUsuarioMutation,
} = usuariosApi;
