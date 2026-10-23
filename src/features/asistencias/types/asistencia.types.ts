export type MetodoAsistencia = "QR" | "DNI_MANUAL" | "BIOMETRICO" | "MANUAL" | string;
export type EstadoAsistencia = "PRESENTE" | "TARDANZA" | "FALTA" | "JUSTIFICADO" | string;

export interface PersonaInfoAsistencia {
  id: number;
  nombre?: string;
  dni?: string;
  expediente?: string | null;
}

export interface HitoInfoAsistencia {
  id: number;
  nombre?: string;
}

export interface SesionAsistencia {
  id: number;
  persona_id?: number;
  hito_id?: number;
  numero?: number;
  fecha: string;
  hora?: string;
  tipo?: "presencial" | "virtual" | string;
  asistio?: boolean;
  programada?: boolean;
  comprobante?: string | null;
  comprobante_url?: string | null;
  notas?: string | null;
  estado?: EstadoAsistencia;
  metodo?: MetodoAsistencia;
  observacion?: string | null;
  created_at?: string;
  updated_at?: string;

  // Relaciones
  persona?: PersonaInfoAsistencia;
  hito?: HitoInfoAsistencia;

  // Propiedades formateadas para la UI
  beneficiarioNombre?: string;
  beneficiarioDni?: string;
  hitoNombre?: string;
}

export interface ListarSesionesParams {
  persona_id?: number;
  hito_id?: number;
  q?: string;
}

// Alias de retrocompatibilidad
export type Asistencia = SesionAsistencia;

export interface RegistrarSesionPayload {
  persona_id?: number;
  sesion_id?: number;
  fecha: string;
  hora?: string;
  estado?: EstadoAsistencia;
  metodo?: MetodoAsistencia;
  observacion?: string;
  dni?: string;
  hitoId?: string | number;
}

export type RegistroAsistenciaPayload = RegistrarSesionPayload;

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}
