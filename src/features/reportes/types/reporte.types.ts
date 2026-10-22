export interface ReporteItem {
  programa: string;
  totalInscritos: number;
  totalPresentes: number;
  totalTardanzas: number;
  totalFaltas: number;
  totalJustificados: number;
  porcentajeEfectividad: number;
}

export interface ReporteFiltrosState {
  fechaInicio: string;
  fechaFin: string;
  programa: string;
}
