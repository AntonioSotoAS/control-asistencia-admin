export interface PersonaJustificacion {
  id: number;
  nombre?: string;
  dni?: string;
  expediente?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface SesionJustificacion {
  id: number;
  fecha?: string;
  hito_id?: number;
  hito?: {
    id: number;
    nombre?: string;
  };
}

export interface Justificacion {
  id: number;
  persona_id?: number;
  sesion_id?: number | null;
  fecha: string;
  motivo: string;
  archivo?: string | null;
  archivo_url?: string | null;
  estado?: string;
  observacion?: string | null;
  created_at?: string;
  updated_at?: string;

  // Relaciones retornadas por el backend
  persona?: PersonaJustificacion;
  sesion?: SesionJustificacion;

  // Propiedades auxiliares para la interfaz
  beneficiarioNombre?: string;
  beneficiarioDni?: string;
  hitoNombre?: string;
  sustentoDocUrl?: string;
  fechaSolicitud?: string;
}

export interface RegistrarJustificacionPayload {
  fecha: string;
  motivo: string;
  sesion_id?: number | null;
  archivo?: File | null;
}

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}
