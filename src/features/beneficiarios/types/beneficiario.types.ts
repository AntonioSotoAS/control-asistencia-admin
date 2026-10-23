export type SeguimientoTipo =
  | "en_curso"
  | "cumple"
  | "alerta"
  | "incumplimiento"
  | "culminado";

export interface BeneficiarioHito {
  id: number;
  titulo: string;
  fecha: string | null;
  sesiones_requeridas: number;
  asistencias: number;
  progreso: number; // 0 a 100
  completado: boolean;
  revision: string | null;
  estado: string;
}

export interface BeneficiarioUsuario {
  id: number;
  identificador: string;
  rol: string;
  estado: "activo" | "inactivo" | string;
}

export interface Beneficiario {
  id: number;
  nombre: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  expediente?: string | null;
  juzgado?: string | null;
  seguimiento?: SeguimientoTipo | string | null;
  consentimiento_aceptado: boolean;
  consentimiento_fecha?: string | null;
  firma_digital?: string | null;
  usuario?: BeneficiarioUsuario | null;
  hito?: BeneficiarioHito | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BeneficiarioFilterParams {
  q?: string;
  seguimiento?: string;
  estado?: string;
}
