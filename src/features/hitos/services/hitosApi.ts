import { baseApi } from "@/shared/services/baseApi";
import type {
  HitoAdmin,
  SesionHitoAdmin,
  ListarHitosAdminParams,
  AgendarFechasHitoPayload,
  RevisarFechasHitoPayload,
} from "../types/hito.types";

function normalizeAdminHito(item: Partial<HitoAdmin> & Record<string, unknown>): HitoAdmin {
  const persona = (item.persona || {}) as Record<string, unknown>;
  const rawSesiones = (item.sesiones as (Partial<SesionHitoAdmin> & Record<string, unknown>)[]) || [];

  const sesiones: SesionHitoAdmin[] = rawSesiones.map((s) => ({
    id: Number(s.id),
    numero: s.numero ? Number(s.numero) : undefined,
    hito_id: s.hito_id ? Number(s.hito_id) : undefined,
    persona_id: s.persona_id ? Number(s.persona_id) : undefined,
    fecha: (s.fecha as string) || "",
    hora: (s.hora as string) || null,
    tipo: (s.tipo as string) || "presencial",
    asistio: Boolean(s.asistio),
    programada: Boolean(s.programada),
    comprobante: (s.comprobante as string) || null,
    comprobante_url: (s.comprobante_url as string) || null,
    notas: (s.notas as string) || null,
    estado: (s.estado as string) || (s.asistio ? "asistio" : "pendiente"),
    observacion: (s.observacion as string) || (s.notas as string) || null,
  }));

  const fechas: string[] =
    (item.fechas as string[]) ||
    (item.fechas_sesiones as string[]) ||
    sesiones.map((s) => s.fecha).filter(Boolean) ||
    [];

  const sesionesTotales =
    Number(item.sesiones_totales) ||
    Number(item.sesiones_count) ||
    Number(item.sesiones_requeridas) ||
    Number(item.totalEsperados) ||
    fechas.length ||
    (item.id ? 1 : 0);

  const sesionesCompletadas =
    Number(item.sesiones_completadas) ||
    Number(item.asistencias_count) ||
    Number(item.asistencias) ||
    Number(item.sesiones_asistidas) ||
    Number(item.totalAsistieron) ||
    sesiones.filter((s) => s.asistio || s.estado === "presente" || s.estado === "asistio").length;

  const porcentajeAvance =
    typeof item.porcentaje_avance === "number"
      ? item.porcentaje_avance
      : typeof item.progreso === "number"
        ? Math.round(Number(item.progreso) * 100)
        : sesionesTotales > 0
          ? Math.min(100, Math.round((sesionesCompletadas / sesionesTotales) * 100))
          : 0;

  const tieneHito =
    typeof item.tiene_hito === "boolean"
      ? item.tiene_hito
      : Boolean(item.id !== null && item.id !== undefined && item.id > 0);

  const rawRevision = (item.revision as string) || "pendiente";
  const revision = rawRevision.toLowerCase();

  const rawEstado = (item.estado as string) || "activo";
  const estado = rawEstado.toLowerCase();

  const fechaHito = (item.fecha_hito as string) || (item.fecha as string) || null;

  return {
    id: item.id ? Number(item.id) : null,
    persona_id: Number(item.persona_id) || Number(persona.id) || 0,
    fecha_hito: fechaHito,
    fecha: fechaHito || "Sin fecha",
    nombre:
      (item.nombre as string) ||
      (persona.nombre ? `Hito: ${persona.nombre}` : `Hito de Control #${item.id || "S/N"}`),
    descripcion:
      (item.descripcion as string) ||
      (persona.expediente ? `Expediente: ${persona.expediente}` : "Control de sesiones y avance"),
    revision,
    estado,
    observacion: (item.observacion as string) || (item.observacion_revision as string) || null,
    observacion_revision: (item.observacion_revision as string) || (item.observacion as string) || null,
    valido: revision === "valida",
    created_at: (item.created_at as string) || undefined,
    updated_at: (item.updated_at as string) || undefined,
    persona: item.persona as HitoAdmin["persona"],
    sesiones,
    fechas,
    fechas_sesiones: fechas,
    sesiones_totales: sesionesTotales,
    sesiones_count: sesionesTotales,
    sesiones_requeridas: sesionesTotales,
    sesiones_completadas: sesionesCompletadas,
    asistencias_count: sesionesCompletadas,
    sesiones_asistidas: sesionesCompletadas,
    totalEsperados: sesionesTotales,
    totalAsistieron: sesionesCompletadas,
    porcentaje_avance: porcentajeAvance,
    tiene_hito: tieneHito,
    horaInicio: (item.horaInicio as string) || "08:00",
    horaFin: (item.horaFin as string) || "12:00",
    toleranciaMinutos: Number(item.toleranciaMinutos) || 15,
    ubicacion: (item.ubicacion as string) || "Sede Institucional",
  };
}

export const hitosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/admin/hitos (Lista los hitos de todos los usuarios)
    getHitosAdmin: builder.query<HitoAdmin[], ListarHitosAdminParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number | boolean> = {};

        if (params?.q && params.q.trim()) {
          queryParams.q = params.q.trim();
        }
        if (params?.revision) {
          queryParams.revision = params.revision;
        }
        if (params?.estado) {
          queryParams.estado = params.estado;
        }
        if (params?.persona_id !== undefined && params.persona_id !== null) {
          queryParams.persona_id = params.persona_id;
        }
        if (params?.incluir_sin_hito !== undefined) {
          queryParams.incluir_sin_hito = params.incluir_sin_hito;
        }

        return {
          url: "/admin/hitos",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      transformResponse: (response: unknown): HitoAdmin[] => {
        let rawList: (Partial<HitoAdmin> & Record<string, unknown>)[] = [];

        if (Array.isArray(response)) {
          rawList = response;
        } else if (response && typeof response === "object") {
          const resObj = response as Record<string, unknown>;
          if (Array.isArray(resObj.data)) {
            rawList = resObj.data as (Partial<HitoAdmin> & Record<string, unknown>)[];
          } else if (resObj.id || resObj.persona_id) {
            rawList = [resObj as Partial<HitoAdmin> & Record<string, unknown>];
          }
        }

        return rawList.map(normalizeAdminHito);
      },
      providesTags: (result) =>
        result
          ? [
            ...result
              .filter((h) => h.id !== null)
              .map(({ id }) => ({ type: "Hito" as const, id: id! })),
            { type: "Hito", id: "LIST" },
          ]
          : [{ type: "Hito", id: "LIST" }],
    }),

    // GET /api/admin/hitos/{id} (Obtiene los detalles de un hito específico)
    getHitoAdminById: builder.query<HitoAdmin, number>({
      query: (id) => `/admin/hitos/${id}`,
      transformResponse: (response: unknown): HitoAdmin => {
        if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          return normalizeAdminHito(d as Partial<HitoAdmin> & Record<string, unknown>);
        }
        return normalizeAdminHito(response as Partial<HitoAdmin> & Record<string, unknown>);
      },
      providesTags: (_result, _error, id) => [{ type: "Hito", id }],
    }),

    // POST /api/hitos/fechas (Registra las fechas de las sesiones del hito)
    agendarFechasHito: builder.mutation<
      { message?: string; mensaje?: string; hito?: HitoAdmin },
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

    // PUT /api/hitos/{id}/revision (Revisa la validez de las fechas del hito)
    revisarFechasHito: builder.mutation<
      { message?: string; mensaje?: string; hito?: HitoAdmin },
      RevisarFechasHitoPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/hitos/${id}/revision`,
        method: "PUT",
        body: {
          ...(body.revision ? { revision: body.revision } : {}),
          ...(body.valido !== undefined ? { valido: body.valido } : {}),
          ...(body.estado ? { estado: body.estado } : {}),
          ...(body.observacion ? { observacion: body.observacion } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Hito", id },
        { type: "Hito", id: "LIST" },
      ],
    }),

    // Alias para compatibilidad general
    getHitos: builder.query<HitoAdmin[], void>({
      query: () => "/admin/hitos",
      transformResponse: (response: unknown): HitoAdmin[] => {
        let rawList: (Partial<HitoAdmin> & Record<string, unknown>)[] = [];
        if (Array.isArray(response)) {
          rawList = response;
        } else if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) rawList = d as any[];
        }
        return rawList.map(normalizeAdminHito);
      },
      providesTags: [{ type: "Hito", id: "LIST" }],
    }),
  }),
});

export const {
  useGetHitosAdminQuery,
  useGetHitoAdminByIdQuery,
  useAgendarFechasHitoMutation,
  useRevisarFechasHitoMutation,
  useGetHitosQuery,
} = hitosApi;
