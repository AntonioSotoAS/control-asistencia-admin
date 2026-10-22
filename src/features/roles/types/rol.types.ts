export interface Rol {
  id: number;
  codigo: string;
  nombre: string;
  created_at?: string;
  updated_at?: string;
  usuarios_count?: number;
}

export interface CrearRolPayload {
  codigo: string;
  nombre: string;
}

export interface ActualizarRolPayload {
  id: number;
  codigo?: string;
  nombre: string;
}

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}

export const ROLES_DEL_SISTEMA = [
  "superadmin",
  "admin",
  "asistente",
  "beneficiario",
  "juez",
] as const;

export function esRolProtegido(codigo: string): boolean {
  return ROLES_DEL_SISTEMA.includes(codigo.toLowerCase() as typeof ROLES_DEL_SISTEMA[number]);
}
