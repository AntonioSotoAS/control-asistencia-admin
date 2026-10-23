export interface UserProfile {
  id?: number | string;
  identificador?: string;
  nombre?: string;
  rol?: "superadmin" | "admin" | "asistente" | "beneficiario" | "juez" | string;
  correo?: string;
  email?: string;
  dni?: string;
  expediente?: string | null;
  activo?: boolean;
  pantallas?: string[];
}

export interface LoginRequest {
  identificador: string;
  password: string;
  codigo?: string;
}

export interface LoginResponse {
  token?: string;
  usuario?: UserProfile;
  user?: UserProfile;
  data?: {
    token: string;
    usuario?: UserProfile;
    user?: UserProfile;
    pantallas?: string[];
    [key: string]: unknown;
  };
  pantallas?: string[];
  mensaje?: string;
  message?: string;
}

export interface PerfilPersona {
  id: number;
  nombre?: string;
  dni?: string;
  email?: string;
  telefono?: string;
  expediente?: string | null;
  juzgado?: string | null;
  seguimiento?: string | null;
  pantallas?: string[];
  usuario?: {
    id: number;
    identificador: string;
    rol: string;
    estado: string;
    pantallas?: string[];
  };
  consentimiento?: boolean;
}

export interface PerfilResponse {
  data: PerfilPersona;
  mensaje?: string;
}

export interface HealthResponse {
  success: boolean;
  data?: {
    servicio: string;
    estado: string;
  };
}

export interface ConsentimientoPayload {
  consentimiento?: boolean;
  observacion?: string;
  [key: string]: unknown;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}
