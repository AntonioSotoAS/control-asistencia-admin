export interface Faq {
  id: number;
  slug?: string;
  orden?: number;
  pregunta: string;
  respuesta: string;
  claves?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CrearFaqPayload {
  pregunta: string;
  respuesta: string;
  slug?: string;
  claves?: string[];
  orden?: number;
}

export interface ActualizarFaqPayload {
  id: number;
  pregunta?: string;
  respuesta?: string;
  slug?: string;
  claves?: string[];
  orden?: number;
}

export interface ApiErrorResponse {
  message?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
}

