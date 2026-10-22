import { baseApi } from "@/shared/services/baseApi";
import type {
  SesionAsistencia,
  RegistrarSesionPayload,
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
    (hito.nombre as string) ||
    (item.hito_id ? `Hito #${item.hito_id}` : "Sesión de Control");

  const rawEstado = (item.estado as string) || "PRESENTE";
  const estado = rawEstado.toUpperCase();

  const rawMetodo = (item.metodo as string) || "QR";
  const metodo = rawMetodo.toUpperCase();

  const rawHora = (item.hora as string) || (item.hora_marcado as string);
  const hora = rawHora || (typeof item.created_at === "string" ? item.created_at.split("T")[1]?.slice(0, 5) : "—");

  return {
    id: Number(item.id),
    persona_id: item.persona_id ? Number(item.persona_id) : undefined,
    hito_id: item.hito_id ? Number(item.hito_id) : undefined,
    fecha: (item.fecha as string) || (typeof item.created_at === "string" ? item.created_at.split("T")[0] : "—"),
    hora,
    estado,
    metodo,
    observacion: (item.observacion as string) || null,
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
    getSesiones: builder.query<SesionAsistencia[], void>({
      query: () => "/sesiones",
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
      query: (body) => ({
        url: "/sesiones",
        method: "POST",
        body,
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
} = asistenciasApi;

// Aliases para máxima compatibilidad con componentes existentes
export const useGetAsistenciasQuery = useGetSesionesQuery;
export const useRegistrarAsistenciaMutation = useRegistrarSesionMutation;
