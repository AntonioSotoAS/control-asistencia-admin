export interface Usuario {
  id: string | number;
  identificador: string;
  nombre: string;
  rol: "ADMIN" | "SUPERVISOR" | "OPERADOR";
  correo: string;
  activo: boolean;
  ultimoAcceso?: string;
  fechaCreacion?: string;
}
