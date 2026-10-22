export type RolUsuario =
  | "superadmin"
  | "admin"
  | "asistente"
  | "beneficiario"
  | "juez"
  | (string & {});

export type EstadoUsuario = "activo" | "inactivo";

export interface PersonaInfo {
  id: number;
  nombre?: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  expediente?: string | null;
  telefono?: string | null;
  correo?: string | null;
  email?: string | null;
  [key: string]: unknown;
}

export interface Usuario {
  id: number;
  persona_id: number;
  identificador: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  created_at?: string;
  updated_at?: string;
  persona?: PersonaInfo;
  // Campos complementarios en caso de join directo del backend
  nombre?: string;
  correo?: string;
}

export interface CrearUsuarioPayload {
  persona_id: number;
  identificador: string;
  password: string;
  rol: RolUsuario;
  estado?: EstadoUsuario;
}

export interface ActualizarUsuarioPayload {
  id: number;
  persona_id?: number;
  identificador?: string;
  password?: string;
  rol?: RolUsuario;
  estado?: EstadoUsuario;
}

export interface ListarUsuariosParams {
  q?: string;
}

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}
