import type { Persona } from "@/features/personas/types/persona.types";
import type { SesionAsistencia } from "@/features/asistencias/types/asistencia.types";
import type { Justificacion } from "@/features/justificaciones/types/justificacion.types";

export interface AlertaInasistencia {
  id: string | number;
  sesionId?: number;
  personaId?: number;
  nombre: string;
  dni: string;
  telefono?: string | null;
  email?: string | null;
  expediente?: string | null;
  juzgado?: string | null;
  seguimiento?: string | null;
  tipo: "FALTA" | "TARDANZA";
  fecha: string;
  hora?: string;
  hitoNombre: string;
  estadoJustificacion: "SIN_JUSTIFICAR" | "PENDIENTE" | "JUSTIFICADA";
  justificacionId?: number;
  personaCompleta?: Persona;
  sesionOriginal?: SesionAsistencia;
  justificacionOriginal?: Justificacion;
}

export interface DashboardKPIS {
  totalFaltas: number;
  totalTardanzas: number;
  justificacionesPendientes: number;
  totalBeneficiarios: number;
  asistenciaTasa: number;
}

export interface DashboardResumen {
  totalBeneficiarios: number;
  asistenciaHoyPorcentaje: number;
  totalPresentesHoy: number;
  totalEsperadosHoy: number;
  justificacionesPendientes: number;
  hitosActivos: number;
}

export interface TendenciaAsistencia {
  dia: string;
  presentes: number;
  tardanzas: number;
  faltas: number;
}

export interface ActividadReciente {
  id: string;
  beneficiario: string;
  dni: string;
  hito: string;
  hora: string;
  estado: "PRESENTE" | "TARDANZA" | "FALTA" | "JUSTIFICADO";
}
