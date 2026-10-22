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
