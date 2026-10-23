import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "@/features/auth/services/authSlice";

const apiBase =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/+$/, "") || "/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBase,
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    const token = sessionStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 419)) {
    const url = typeof args === "string" ? args : args.url;
    // No interceptar peticiones de login que fallan por credenciales incorrectas ni health check público
    if (!url.includes("/login") && !url.includes("/health")) {
      // 1. Despachar logout en Redux y limpiar credenciales
      api.dispatch(logout());

      // 2. Guardar mensaje para mostrarlo en la pantalla de inicio de sesión
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "session_expired_msg",
          "Tu sesión ha expirado o no tienes un token válido. Por favor inicia sesión nuevamente."
        );

        // 3. Redirigir inmediatamente a la pantalla de login si no estamos en ella
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Persona", "Hito", "Sesion", "Usuario", "Rol", "Justificacion", "Pantalla"],
  endpoints: () => ({}),
});
