export interface ActoProcesal {
  id: number;
  x_nom_instancia?: string | null;
  n_unico?: string | null;
  n_incidente?: number | null;
  x_formato?: string | null;
  x_desc_acto_procesal?: string | null;
  x_resolucion?: string | null;
  f_ingreso_acto?: string | null;
  l_tipo_parte?: string | null;
  x_ape_paterno?: string | null;
  x_ape_materno?: string | null;
  x_nombres?: string | null;
  x_doc_id?: string | null;
  x_sumilla?: string | null;
}

export interface ListarActosProcesalesParams {
  page?: number;
  limit?: number;
  n_unico?: string;
  x_doc_id?: string;
  f_ingreso_acto?: string;
}

export interface ActoProcesalCaso {
  expediente: string;
  juzgado: string;
  tipo_parte: string;
  f_ingreso_acto?: string | null;
}

export interface ActoPorDocumentoData {
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre: string;
  casos: ActoProcesalCaso[];
  persona_existente?: {
    id: number;
    nombre: string;
    tiene_cuenta: boolean;
  } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  current_page: number;
  per_page: number;
  last_page: number;
  has_more_pages: boolean;
  from?: number | null;
  to?: number | null;
}

export interface ActosProcesalesResponse {
  success: boolean;
  data: ActoProcesal[];
  pagination: PaginationMeta;
}

