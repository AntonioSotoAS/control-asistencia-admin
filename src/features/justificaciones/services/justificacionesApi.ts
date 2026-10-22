import { baseApi } from "@/shared/services/baseApi";
import type {
  Justificacion,
  RegistrarJustificacionPayload,
} from "../types/justificacion.types";

function normalizeJustificacion(item: Partial<Justificacion> & Record<string, unknown>): Justificacion {
  const persona = (item.persona || {}) as Record<string, unknown>;
  const sesion = (item.sesion || {}) as Record<string, unknown>;
  const hito = (sesion.hito || {}) as Record<string, unknown>;

  const beneficiarioNombre =
    (item.beneficiarioNombre as string) ||
    (persona.nombre as string) ||
    (item.nombre_persona as string) ||
    (item.nombre as string) ||
    "Beneficiario Registrado";

  const beneficiarioDni =
    (item.beneficiarioDni as string) ||
    (persona.dni as string) ||
    (item.dni as string) ||
    "—";

  const hitoNombre =
    (item.hitoNombre as string) ||
    (hito.nombre as string) ||
    (item.sesion_id ? `Sesión #${item.sesion_id}` : "Inasistencia");

  const fechaSolicitud =
    (item.fecha as string) ||
    (item.fechaSolicitud as string) ||
    (typeof item.created_at === "string" ? item.created_at.split("T")[0] : "—");

  const sustentoDocUrl =
    (item.archivo_url as string) ||
    (item.archivo as string) ||
    (item.sustentoDocUrl as string) ||
    undefined;

  const rawEstado = (item.estado as string) || "PENDIENTE";
  const estado = rawEstado.toUpperCase();

  return {
    id: Number(item.id),
    persona_id: item.persona_id ? Number(item.persona_id) : undefined,
    sesion_id: item.sesion_id ? Number(item.sesion_id) : null,
    fecha: (item.fecha as string) || fechaSolicitud,
    motivo: (item.motivo as string) || "Sin motivo especificado",
    archivo: (item.archivo as string) || null,
    archivo_url: sustentoDocUrl || null,
    estado,
    observacion: (item.observacion as string) || null,
    created_at: (item.created_at as string) || undefined,
    updated_at: (item.updated_at as string) || undefined,
    persona: item.persona as Justificacion["persona"],
    sesion: item.sesion as Justificacion["sesion"],
    beneficiarioNombre,
    beneficiarioDni,
    hitoNombre,
    sustentoDocUrl,
    fechaSolicitud,
  };
}

export const justificacionesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJustificaciones: builder.query<Justificacion[], void>({
      query: () => "/justificaciones",
      transformResponse: (response: unknown): Justificacion[] => {
        let rawList: (Partial<Justificacion> & Record<string, unknown>)[] = [];

        if (Array.isArray(response)) {
          rawList = response;
        } else if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) {
            rawList = d;
          }
        }

        return rawList.map(normalizeJustificacion);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Justificacion" as const, id })),
              { type: "Justificacion", id: "LIST" },
            ]
          : [{ type: "Justificacion", id: "LIST" }],
    }),

    registrarJustificacion: builder.mutation<
      Justificacion,
      FormData | RegistrarJustificacionPayload
    >({
      query: (body) => {
        let finalBody: FormData;

        if (body instanceof FormData) {
          finalBody = body;
        } else {
          finalBody = new FormData();
          finalBody.append("fecha", body.fecha);
          finalBody.append("motivo", body.motivo);
          if (body.sesion_id !== undefined && body.sesion_id !== null) {
            finalBody.append("sesion_id", String(body.sesion_id));
          }
          if (body.archivo) {
            finalBody.append("archivo", body.archivo);
          }
        }

        return {
          url: "/justificaciones",
          method: "POST",
          body: finalBody,
        };
      },
      invalidatesTags: [{ type: "Justificacion", id: "LIST" }],
    }),
  }),
});

export const {
  useGetJustificacionesQuery,
  useRegistrarJustificacionMutation,
} = justificacionesApi;
