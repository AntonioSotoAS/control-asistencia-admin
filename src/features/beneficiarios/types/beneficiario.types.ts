export interface Beneficiario {
  id: string | number;
  dni: string;
  nombres: string;
  apellidos: string;
  programa: string;
  estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
  telefono?: string;
  correo?: string;
  fechaRegistro?: string;
  asistenciasRegistradas?: number;
}

export interface BeneficiarioFilterParams {
  busqueda?: string;
  estado?: string;
  programa?: string;
  pagina?: number;
  limite?: number;
}
