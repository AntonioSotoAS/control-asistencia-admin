export interface Persona {
  id: number;
  nombre: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  expediente?: string | null;
  juzgado?: string | null;
  seguimiento?: string | null;
  created_at?: string;
  updated_at?: string;
  usuario?: {
    id: number;
    identificador: string;
    rol: string;
    estado: string;
  } | null;
}

export interface CrearPersonaPayload {
  nombre: string;
  dni: string;
  email?: string;
  telefono?: string;
  expediente?: string;
  juzgado?: string;
  seguimiento?: string;
}

export interface ActualizarPersonaPayload {
  id: number;
  nombre: string;
  dni: string;
  email?: string;
  telefono?: string;
  expediente?: string;
  juzgado?: string;
  seguimiento?: string;
}

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}
