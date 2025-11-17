export interface EquipoEntregado {
  // Los IDs son opcionales porque vienen del frontend pero NO se usan en el PDF
  categoria_id?: number;
  subcategoria_id?: number;
  marca_id?: number;
  modelo_id?: number;
  
  // Solo estos campos se envían al PDF
  equipo: string;           // Nombre de la subcategoría
  marca: string;           // Nombre de la marca
  modelo: string;          // Nombre del modelo
  serie: string;
  inventario: string;
  hostname?: string;
  procesador?: string;
  disco?: string;
  ram?: string;
}

export interface EquipoRecojo extends EquipoEntregado {
  estado: 'OPERATIVO' | 'INOPERATIVO' | 'DAÑO FISICO' | 'POR VALIDAR';
}

export interface GenerarActaRequest {
  tipo_atencion: 'PRESTAMO' | 'REEMPLAZO' | 'ASIGNACION' | 'UPGRADE';
  usuario: string;
  ticket: string;
  email: string;
  area: string;
  cargo: string;
  fecha_inicio: string;
  fecha_fin: string;
  local_id: number;
  jefe_responsable: string;
  ing_soporte: string;
  equipos_entregados: EquipoEntregado[];
  observaciones_entregados?: string;
  equipos_recojo?: EquipoRecojo[];
  observaciones_recojo?: string;
}

export interface GenerarActaResponse {
  success: boolean;
  mensaje: string;
  pdf?: Buffer;
}