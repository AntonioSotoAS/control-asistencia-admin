export interface ApiResponse<T> {
  data: T;
  mensaje?: string;
  exito?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas?: number;
}

export interface QueryPaginationParams {
  pagina?: number;
  limite?: number;
  busqueda?: string;
  orden?: string;
  direccion?: "asc" | "desc";
}

export type EstadoAsistencia = "PRESENTE" | "FALTA" | "TARDANZA" | "JUSTIFICADO";
export type EstadoJustificacion = "PENDIENTE" | "APROBADA" | "RECHAZADA";
export type RolUsuario = "ADMIN" | "OPERADOR" | "SUPERVISOR";
