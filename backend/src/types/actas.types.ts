export interface EquipoEntregado {
  equipo: string;
  marca: string;
  modelo: string;
  serie: string;
  inventario: string;
  hostname?: string;
  procesador?: string;
  disco?: string;
  ram?: string;
}

export interface EquipoRecojo extends EquipoEntregado {
  estado: 'OPERATIVO' | 'INOPERATIVO' | 'DAÑO FISICO';
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