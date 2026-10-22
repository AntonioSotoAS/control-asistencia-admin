export interface SesionHito {
  id?: number;
  fecha: string;
  asistio?: boolean;
  estado?: string;
}

export interface HitoAvance {
  id: number;
  nombre?: string;
  descripcion?: string;
  fecha_hito?: string;
  fecha?: string;
  sesiones_requeridas?: number;
  sesiones_asistidas?: number;
  totalEsperados?: number;
  totalAsistieron?: number;
  porcentaje_avance?: number;
  estado?: string;
  fechas?: string[];
  fechas_sesiones?: string[];
  sesiones?: SesionHito[];
  persona?: {
    id: number;
    nombre?: string;
    dni?: string;
    expediente?: string | null;
  };
  observacion_revision?: string | null;
  valido?: boolean;
  created_at?: string;
  updated_at?: string;
  horaInicio?: string;
  horaFin?: string;
  toleranciaMinutos?: number;
  ubicacion?: string;
}

export type Hito = HitoAvance;

export interface AgendarFechasHitoPayload {
  fechas: string[];
  persona_id?: number;
  hito_id?: number;
  [key: string]: unknown;
}

export interface RevisarFechasHitoPayload {
  id: number;
  valido?: boolean;
  estado?: string;
  observacion?: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}
