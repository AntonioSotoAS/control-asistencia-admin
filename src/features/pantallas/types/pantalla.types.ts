export type GrupoPantalla = "proceso" | "administracion" | "sistema" | string;

export interface Pantalla {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  grupo: GrupoPantalla;
  icono?: string | null;
  ruta: string;
  orden?: number;
  activa: boolean;
  asignada?: boolean; // Presente cuando se consulta GET /api/roles/{rol}/pantallas
  created_at?: string;
  updated_at?: string;
}

export interface CrearPantallaPayload {
  codigo: string;
  nombre: string;
  descripcion?: string;
  grupo: GrupoPantalla;
  icono?: string;
  ruta: string;
  orden?: number;
  activa?: boolean;
}

export interface ActualizarPantallaPayload extends Partial<CrearPantallaPayload> {
  id: number;
}

export interface AsignarPantallasRolPayload {
  rolId: number | string;
  pantalla_ids: number[];
}

export interface ListarPantallasParams {
  grupo?: string;
  q?: string;
}
