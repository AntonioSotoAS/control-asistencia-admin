export interface Asistencia {
  id: string | number;
  beneficiarioId?: string | number;
  beneficiarioNombre: string;
  beneficiarioDni: string;
  hitoId?: string | number;
  hitoNombre: string;
  fecha: string;
  hora: string;
  estado: "PRESENTE" | "TARDANZA" | "FALTA" | "JUSTIFICADO";
  metodo: "QR" | "DNI_MANUAL" | "BIOMETRICO";
  observacion?: string;
}

export interface RegistroAsistenciaPayload {
  dni: string;
  hitoId: string | number;
  metodo?: "QR" | "DNI_MANUAL" | "BIOMETRICO";
  observacion?: string;
}
