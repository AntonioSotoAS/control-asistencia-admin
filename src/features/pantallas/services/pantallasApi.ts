import { baseApi } from "@/shared/services/baseApi";
import type {
  Pantalla,
  CrearPantallaPayload,
  ActualizarPantallaPayload,
  AsignarPantallasRolPayload,
  ListarPantallasParams,
} from "../types/pantalla.types";

export const pantallasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/mis-pantallas (Pantallas permitidas para el usuario autenticado)
    getMisPantallas: builder.query<Pantalla[], void>({
      query: () => "/mis-pantallas",
      transformResponse: (response: unknown): Pantalla[] => {
        if (Array.isArray(response)) {
          return response as Pantalla[];
        }
        if (response && typeof response === "object") {
          const resObj = response as Record<string, unknown>;
          if (Array.isArray(resObj.data)) return resObj.data as Pantalla[];
          if (resObj.data && typeof resObj.data === "object") {
            const dataObj = resObj.data as Record<string, unknown>;
            if (Array.isArray(dataObj.pantallas)) return dataObj.pantallas as Pantalla[];
          }
        }
        return [];
      },
      providesTags: [{ type: "Pantalla" as const, id: "USER_LIST" }],
    }),

    // GET /api/pantallas (Catálogo completo de pantallas)
    getPantallas: builder.query<Pantalla[], ListarPantallasParams | void>({
      query: (params) => {
        if (!params) return "/pantallas";
        const queryParams: Record<string, string> = {};
        if (params.grupo?.trim()) queryParams.grupo = params.grupo.trim();
        if (params.q?.trim()) queryParams.q = params.q.trim();
        return {
          url: "/pantallas",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      transformResponse: (response: unknown): Pantalla[] => {
        if (Array.isArray(response)) {
          return response as Pantalla[];
        }
        if (response && typeof response === "object") {
          const resObj = response as Record<string, unknown>;
          if (Array.isArray(resObj.data)) return resObj.data as Pantalla[];
          if (resObj.data && typeof resObj.data === "object") {
            const dataObj = resObj.data as Record<string, unknown>;
            if (Array.isArray(dataObj.pantallas)) return dataObj.pantallas as Pantalla[];
          }
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Pantalla" as const, id })),
            { type: "Pantalla", id: "LIST" },
          ]
          : [{ type: "Pantalla", id: "LIST" }],
    }),

    // GET /api/roles/{rol}/pantallas (Pantallas indicando asignada: true/false para el rol)
    getRolPantallas: builder.query<Pantalla[], number | string>({
      query: (rol) => `/roles/${rol}/pantallas`,
      transformResponse: (response: unknown): Pantalla[] => {
        if (Array.isArray(response)) {
          return response as Pantalla[];
        }
        if (response && typeof response === "object") {
          const resObj = response as Record<string, unknown>;
          let list: Pantalla[] = [];
          let assignedIds: number[] = [];

          if (Array.isArray(resObj.pantallas)) {
            list = resObj.pantallas as Pantalla[];
          } else if (resObj.data && typeof resObj.data === "object") {
            const dataObj = resObj.data as Record<string, unknown>;
            if (Array.isArray(dataObj)) {
              list = dataObj as Pantalla[];
            } else if (Array.isArray(dataObj.pantallas)) {
              list = dataObj.pantallas as Pantalla[];
            }
            if (Array.isArray(dataObj.pantalla_ids)) {
              assignedIds = (dataObj.pantalla_ids as unknown[]).map(Number);
            }
          }

          if (assignedIds.length > 0) {
            return list.map((item) => ({
              ...item,
              asignada: item.asignada !== undefined ? item.asignada : assignedIds.includes(item.id),
            }));
          }

          return list;
        }
        return [];
      },
      providesTags: (_result, _error, rol) => [
        { type: "Pantalla", id: `ROL_${rol}` },
        { type: "Rol", id: rol },
      ],
    }),

    // PUT /api/roles/{rol}/pantallas (Asigna/sincroniza pantallas al rol)
    asignarRolPantallas: builder.mutation<
      { message?: string; mensaje?: string },
      AsignarPantallasRolPayload
    >({
      query: ({ rolId, pantalla_ids }) => ({
        url: `/roles/${rolId}/pantallas`,
        method: "PUT",
        body: { pantalla_ids },
      }),
      invalidatesTags: (_result, _error, { rolId }) => [
        { type: "Pantalla", id: `ROL_${rolId}` },
        { type: "Pantalla", id: "USER_LIST" },
        { type: "Rol", id: rolId },
        { type: "Rol", id: "LIST" },
      ],
    }),

    // POST /api/pantallas (Crea una nueva pantalla)
    crearPantalla: builder.mutation<Pantalla, CrearPantallaPayload>({
      query: (body) => ({
        url: "/pantallas",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Pantalla", id: "LIST" }],
    }),

    // PUT /api/pantallas/{id} (Edita una pantalla)
    actualizarPantalla: builder.mutation<Pantalla, ActualizarPantallaPayload>({
      query: ({ id, ...body }) => ({
        url: `/pantallas/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Pantalla", id },
        { type: "Pantalla", id: "LIST" },
        { type: "Pantalla", id: "USER_LIST" },
      ],
    }),

    // DELETE /api/pantallas/{id} (Elimina una pantalla)
    eliminarPantalla: builder.mutation<{ message?: string; mensaje?: string }, number>({
      query: (id) => ({
        url: `/pantallas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Pantalla", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMisPantallasQuery,
  useGetPantallasQuery,
  useGetRolPantallasQuery,
  useAsignarRolPantallasMutation,
  useCrearPantallaMutation,
  useActualizarPantallaMutation,
  useEliminarPantallaMutation,
} = pantallasApi;
