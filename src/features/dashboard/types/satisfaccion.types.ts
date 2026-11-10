export interface SatisfaccionPorNivel {
  nivel: number;
  etiqueta: string;
  total: number;
}

export interface ReporteSatisfaccionGeneral {
  total: number;
  promedio: number | null;
  actualizados: number;
  ultima_actualizacion: string | null;
  por_nivel: SatisfaccionPorNivel[];
}

export interface SatisfaccionIndividual {
  id: string;
  persona_id: string;
  nombre: string;
  dni: string | null;
  expediente: string | null;
  nivel: number;
  etiqueta: string;
  creado_en: string;
  actualizado_en: string;
  cambio?: {
    nivel_anterior: number;
    nivel_nuevo: number;
    fecha: string;
    por: string | null;
  } | null;
}

export interface ReporteSatisfaccionResponse {
  general?: ReporteSatisfaccionGeneral;
  individual?: SatisfaccionIndividual | null;
}

export interface ReporteSatisfaccionParams {
  persona_id?: number;
  desde?: string;
  hasta?: string;
}

export interface SatisfaccionPersonaItem {
  id: string;
  persona_id: string;
  nivel: number;
  etiqueta: string;
  created_at: string;
  updated_at: string;
  persona?: {
    id: number;
    nombre: string;
    dni: string | null;
    expediente?: string | null;
    telefono?: string | null;
  } | null;
}

export interface SatisfaccionListResponse {
  promedio: number | null;
  total: number;
  personas: SatisfaccionPersonaItem[];
}
