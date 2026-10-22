export interface Hito {
  id: string | number;
  nombre: string;
  descripcion?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  toleranciaMinutos: number;
  ubicacion: string;
  estado: "PROGRAMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO";
  totalEsperados?: number;
  totalAsistieron?: number;
}
