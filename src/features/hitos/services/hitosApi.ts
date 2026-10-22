import { baseApi } from "@/shared/services/baseApi";
import type {
  HitoAvance,
  AgendarFechasHitoPayload,
  RevisarFechasHitoPayload,
} from "../types/hito.types";

function normalizeHito(item: Partial<HitoAvance> & Record<string, unknown>): HitoAvance {
  const fechas: string[] =
    (item.fechas as string[]) ||
    (item.fechas_sesiones as string[]) ||
    [];

  const sesionesRequeridas =
    Number(item.sesiones_requeridas) ||
    Number(item.totalEsperados) ||
    fechas.length ||
    1;

  const sesionesAsistidas =
    Number(item.sesiones_asistidas) ||
    Number(item.totalAsistieron) ||
    0;

  const porcentajeAvance =
    typeof item.porcentaje_avance === "number"
      ? item.porcentaje_avance
      : Math.min(100, Math.round((sesionesAsistidas / Math.max(1, sesionesRequeridas)) * 100));

  return {
    id: Number(item.id) || 1,
    nombre: (item.nombre as string) || `Control de Hito #${item.id || 1}`,
    descripcion:
      (item.descripcion as string) ||
      "Seguimiento programado y avance de asistencias.",
    fecha_hito: (item.fecha_hito as string) || (item.fecha as string),
    fecha: (item.fecha as string) || (item.fecha_hito as string) || "—",
    sesiones_requeridas: sesionesRequeridas,
    sesiones_asistidas: sesionesAsistidas,
    totalEsperados: sesionesRequeridas,
    totalAsistieron: sesionesAsistidas,
    porcentaje_avance: porcentajeAvance,
    estado: ((item.estado as string) || "EN_PROGRESO").toUpperCase(),
    fechas,
    fechas_sesiones: fechas,
    sesiones: (item.sesiones as HitoAvance["sesiones"]) || [],
    persona: item.persona as HitoAvance["persona"],
    observacion_revision: (item.observacion_revision as string) || null,
    valido: typeof item.valido === "boolean" ? item.valido : undefined,
    horaInicio: (item.horaInicio as string) || "08:00",
    horaFin: (item.horaFin as string) || "12:00",
    toleranciaMinutos: Number(item.toleranciaMinutos) || 15,
    ubicacion: (item.ubicacion as string) || "Sede Institucional",
  };
}

export const hitosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHitos: builder.query<HitoAvance[], void>({
      query: () => "/hitos",
      transformResponse: (response: unknown): HitoAvance[] => {
        let rawList: (Partial<HitoAvance> & Record<string, unknown>)[] = [];

        if (Array.isArray(response)) {
          rawList = response;
        } else if (response && typeof response === "object") {
          const resObj = response as Record<string, unknown>;
          if (Array.isArray(resObj.data)) {
            rawList = resObj.data as (Partial<HitoAvance> & Record<string, unknown>)[];
          } else if (resObj.id || resObj.fecha_hito || resObj.fecha) {
            // El backend retorna un solo objeto de hito/avance
            rawList = [resObj as Partial<HitoAvance> & Record<string, unknown>];
          }
        }

        return rawList.map(normalizeHito);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Hito" as const, id })),
              { type: "Hito", id: "LIST" },
            ]
          : [{ type: "Hito", id: "LIST" }],
    }),

    agendarFechasHito: builder.mutation<
      { message?: string; mensaje?: string; hito?: HitoAvance },
      AgendarFechasHitoPayload
    >({
      query: (body) => ({
        url: "/hitos/fechas",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Hito", id: "LIST" },
        { type: "Sesion", id: "LIST" },
      ],
    }),

    revisarFechasHito: builder.mutation<
      { message?: string; mensaje?: string; hito?: HitoAvance },
      RevisarFechasHitoPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/hitos/${id}/revision`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Hito", id },
        { type: "Hito", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetHitosQuery,
  useAgendarFechasHitoMutation,
  useRevisarFechasHitoMutation,
} = hitosApi;
