export interface Justificacion {
  id: string | number;
  beneficiarioId?: string | number;
  beneficiarioNombre: string;
  beneficiarioDni: string;
  hitoNombre: string;
  motivo: string;
  sustentoDocUrl?: string;
  fechaSolicitud: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  fechaRespuesta?: string;
  respuestaObservacion?: string;
}

export interface ResponderJustificacionPayload {
  id: string | number;
  estado: "APROBADA" | "RECHAZADA";
  respuestaObservacion?: string;
}
