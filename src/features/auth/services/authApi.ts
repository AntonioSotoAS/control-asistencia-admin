import { baseApi } from "@/shared/services/baseApi";

export type LoginRequest = {
  identificador: string;
  password: string;
};

export type LoginResponse = {
  data: {
    token: string;
    usuario?: {
      id?: number | string;
      nombre?: string;
      rol?: string;
      correo?: string;
    };
  };
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Usuario"],
    }),

    getPerfil: builder.query<unknown, void>({
      query: () => "/perfil",
      providesTags: ["Usuario"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetPerfilQuery,
} = authApi;
