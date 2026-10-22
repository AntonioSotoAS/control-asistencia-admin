export interface UserProfile {
  id?: number | string;
  identificador?: string;
  nombre?: string;
  rol?: "admin" | "operador" | "supervisor" | string;
  correo?: string;
  activo?: boolean;
}

export interface LoginRequest {
  identificador: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    usuario?: UserProfile;
  };
  mensaje?: string;
}

export interface PerfilResponse {
  data: UserProfile;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}
