export type RevisionHito = "pendiente" | "valida" | "observada" | string;
export type EstadoHito = "activo" | "cerrado" | string;

export interface BeneficiarioHitoInfo {
  id: number;
  nombre: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  expediente?: string | null;
  juzgado?: string | null;
  seguimiento?: string | null;
}

export interface SesionHitoAdmin {
  id: number;
  numero?: number;
  hito_id?: number;
  persona_id?: number;
  fecha: string;
  hora?: string | null;
  tipo?: string;
  asistio?: boolean;
  programada?: boolean;
  comprobante?: string | null;
  comprobante_url?: string | null;
  notas?: string | null;
  estado?: string | null; // presente, tardanza, falta, pendiente, etc.
  observacion?: string | null;
}

export interface HitoAdmin {
  id: number | null;
  persona_id: number;
  fecha_hito?: string | null;
  fecha?: string | null;
  nombre?: string;
  descripcion?: string;
  revision: RevisionHito;
  estado: EstadoHito;
  observacion?: string | null;
  observacion_revision?: string | null;
  valido?: boolean;
  created_at?: string;
  updated_at?: string;

  // Datos del beneficiario vinculado
  persona?: BeneficiarioHitoInfo;

  // Sesiones agendadas
  sesiones?: SesionHitoAdmin[];
  fechas?: string[];
  fechas_sesiones?: string[];

  // Métricas calculadas / devueltas por backend
  sesiones_count?: number;
  sesiones_totales?: number;
  sesiones_requeridas?: number;
  asistencias_count?: number;
  sesiones_completadas?: number;
  sesiones_asistidas?: number;
  porcentaje_avance?: number;
  tiene_hito?: boolean;

  // Compatibilidad
  totalEsperados?: number;
  totalAsistieron?: number;
  horaInicio?: string;
  horaFin?: string;
  toleranciaMinutos?: number;
  ubicacion?: string;
}

// Alias de retrocompatibilidad
export type HitoAvance = HitoAdmin;
export type Hito = HitoAdmin;

export interface ListarHitosAdminParams {
  q?: string;
  revision?: "pendiente" | "valida" | "observada" | "";
  estado?: "activo" | "cerrado" | "";
  persona_id?: number;
  incluir_sin_hito?: boolean;
}

export interface AgendarFechasHitoPayload {
  fechas: string[];
  persona_id?: number;
  hito_id?: number;
  [key: string]: unknown;
}

export interface RevisarFechasHitoPayload {
  id: number;
  valido?: boolean;
  revision?: "valida" | "observada" | "pendiente" | string;
  estado?: string;
  observacion?: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}
