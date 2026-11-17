import { baseApi } from "@/shared/services/baseApi";
import type {
  SesionAsistencia,
  RegistrarSesionPayload,
  ListarSesionesParams,
} from "../types/asistencia.types";

function normalizeSesion(item: Partial<SesionAsistencia> & Record<string, unknown>): SesionAsistencia {
  const persona = (item.persona || {}) as Record<string, unknown>;
  const hito = (item.hito || {}) as Record<string, unknown>;

  const beneficiarioNombre =
    (item.beneficiarioNombre as string) ||
    (persona.nombre as string) ||
    (item.nombre as string) ||
    (item.nombre_beneficiario as string) ||
    (item.persona_id ? `Persona #${item.persona_id}` : "Beneficiario");

  const beneficiarioDni =
    (item.beneficiarioDni as string) ||
    (persona.dni as string) ||
    (item.dni as string) ||
    "—";

  const hitoNombre =
    (item.hitoNombre as string) ||
    (hito.titulo as string) ||
    (hito.nombre as string) ||
    (item.hito_id ? `Hito #${item.hito_id}` : "Sesión de Control");

  const asistio = Boolean(item.asistio);
  const rawEstado = (item.estado as string) || (asistio ? "PRESENTE" : "PENDIENTE");
  const estado = rawEstado.toUpperCase();

  const rawMetodo = (item.metodo as string) || "QR";
  const metodo = rawMetodo.toUpperCase();

  const rawHora = (item.hora as string) || (item.hora_marcado as string);
  const hora = rawHora || (typeof item.created_at === "string" ? item.created_at.split("T")[1]?.slice(0, 5) : "—");

  return {
    id: Number(item.id),
    persona_id: item.persona_id ? Number(item.persona_id) : undefined,
    hito_id: item.hito_id ? Number(item.hito_id) : undefined,
    numero: item.numero ? Number(item.numero) : undefined,
    fecha: (item.fecha as string) || (typeof item.created_at === "string" ? item.created_at.split("T")[0] : "—"),
    hora,
    tipo: (item.tipo as string) || "presencial",
    asistio,
    programada: Boolean(item.programada),
    comprobante: (item.comprobante as string) || null,
    comprobante_url: (item.comprobante_url as string) || null,
    notas: (item.notas as string) || null,
    estado,
    metodo,
    observacion: (item.observacion as string) || (item.notas as string) || null,
    created_at: (item.created_at as string) || undefined,
    updated_at: (item.updated_at as string) || undefined,
    persona: item.persona as SesionAsistencia["persona"],
    hito: item.hito as SesionAsistencia["hito"],
    beneficiarioNombre,
    beneficiarioDni,
    hitoNombre,
  };
}

export const asistenciasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSesiones: builder.query<SesionAsistencia[], ListarSesionesParams | void>({
      query: (params) => {
        if (!params) {
          return "/sesiones";
        }
        const queryParams: Record<string, string | number> = {};
        if (params.persona_id) {
          queryParams.persona_id = params.persona_id;
        }
        if (params.hito_id) {
          queryParams.hito_id = params.hito_id;
        }
        if (params.q?.trim()) {
          queryParams.q = params.q.trim();
        }

        return {
          url: "/sesiones",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      transformResponse: (response: unknown): SesionAsistencia[] => {
        let rawList: (Partial<SesionAsistencia> & Record<string, unknown>)[] = [];

        if (Array.isArray(response)) {
          rawList = response;
        } else if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) {
            rawList = d;
          }
        }

        return rawList.map(normalizeSesion);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Sesion" as const, id })),
              { type: "Sesion", id: "LIST" },
            ]
          : [{ type: "Sesion", id: "LIST" }],
    }),

    registrarSesion: builder.mutation<SesionAsistencia, RegistrarSesionPayload>({
      query: (body) => {
        const formData = new FormData();
        formData.append("fecha", body.fecha);
        formData.append("tipo", body.tipo || "presencial");
        formData.append("asistio", String(body.asistio ?? true));

        if (body.persona_id) formData.append("persona_id", String(body.persona_id));
        if (body.hito_id || body.hitoId) formData.append("hito_id", String(body.hito_id || body.hitoId));
        if (body.numero) formData.append("numero", String(body.numero));
        if (body.hora) formData.append("hora", body.hora);

        const notas = body.notas || body.observacion;
        if (notas) formData.append("notas", notas);
        if (body.estado) formData.append("estado", body.estado);
        if (body.metodo) formData.append("metodo", body.metodo);

        if (body.comprobante instanceof File) {
          formData.append("comprobante", body.comprobante);
        }

        return {
          url: "/sesiones",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "Sesion", id: "LIST" },
        { type: "Hito", id: "LIST" },
      ],
    }),

    reprogramarFechaSesion: builder.mutation<SesionAsistencia, { id: number; fecha: string }>({
      query: ({ id, fecha }) => ({
        url: `/sesiones/${id}/fecha`,
        method: "PUT",
        body: { fecha },
      }),
      invalidatesTags: [
        { type: "Sesion", id: "LIST" },
        { type: "Hito", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSesionesQuery,
  useRegistrarSesionMutation,
  useReprogramarFechaSesionMutation,
} = asistenciasApi;

// Aliases para máxima compatibilidad con componentes existentes
export const useGetAsistenciasQuery = useGetSesionesQuery;
export const useRegistrarAsistenciaMutation = useRegistrarSesionMutation;
export const useReprogramarFechaAsistenciaMutation = useReprogramarFechaSesionMutation;
