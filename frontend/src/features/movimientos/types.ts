export type TipoMovimiento =
  | 'INGRESO_ALMACEN'
  | 'SALIDA_ASIGNACION'
  | 'SALIDA_REEMPLAZO'
  | 'SALIDA_PRESTAMO'
  | 'RETORNO_TIENDA'
  | 'RETORNO_PERSONA'
  | 'TRANSFERENCIA_TIENDAS'
  | 'CAMBIO_ESTADO'
  | 'INSTALACION_ACCESORIO'
  | 'DESINSTALACION_ACCESORIO';

export type UbicacionMovimiento = 'ALMACEN' | 'TIENDA' | 'PERSONA';

export type EstadoMovimiento = 'PENDIENTE' | 'EN_TRANSITO' | 'COMPLETADO' | 'CANCELADO';

export interface InstalacionAccesorio {
  accesorio_id: number;
  equipo_destino_id: number;
}

export interface EquipoParaInstalacion {
  id: number;
  numero_serie: string;
  inv_entel: string;
  hostname: string;
  modelo_nombre: string;
  marca_nombre: string;
  categoria_nombre: string;
}

export interface Movimiento {
  id: number;
  equipo_id: number;
  tipo_movimiento: TipoMovimiento;
  ubicacion_origen: UbicacionMovimiento;
  tienda_origen_id?: number;
  persona_origen?: string;
  ubicacion_destino: UbicacionMovimiento;
  tienda_destino_id?: number;
  persona_destino?: string;
  estado_movimiento: EstadoMovimiento;
  codigo_acta?: string;
  fecha_salida: string;
  fecha_llegada?: string;
  ticket_helix?: string;
  usuario_id: number;
  motivo?: string;
  observaciones?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Datos de JOINs
  equipo_serie?: string;
  equipo_inv_entel?: string;
  equipo_modelo?: string;
  equipo_marca?: string;
  tienda_origen_nombre?: string;
  tienda_destino_nombre?: string;
  usuario_nombre?: string;
}

export interface CrearMovimientoRequest {
  equipos_ids: number[];
  tipo_movimiento: TipoMovimiento;
  ubicacion_origen: UbicacionMovimiento;
  tienda_origen_id?: number;
  persona_origen?: string;
  ubicacion_destino: UbicacionMovimiento;
  tienda_destino_id?: number;
  persona_destino?: string;
  estado_movimiento: EstadoMovimiento;
  codigo_acta?: string;
  fecha_salida: string;
  fecha_llegada?: string;
  ticket_helix?: string;
  motivo?: string;
  observaciones?: string;
  instalaciones_accesorios?: InstalacionAccesorio[];
}

export interface ActualizarEstadoRequest {
  estado_movimiento: EstadoMovimiento;
  fecha_llegada?: string;
  codigo_acta?: string;
}

export interface MovimientoFilters {
  busqueda?: string; 
  equipo_id?: number;
  tipo_movimiento?: string;
  estado_movimiento?: string;
  ubicacion_origen?: string;
  ubicacion_destino?: string;
  tienda_origen_id?: number;
  tienda_destino_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  codigo_acta?: string;
  page?: number;
  limit?: number;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export interface ActualizarMovimientoData {
  codigo_acta?: string;
  ticket_helix?: string;
  fecha_salida: string;
  fecha_llegada?: string;
  estado_movimiento: 'PENDIENTE' | 'EN_TRANSITO' | 'COMPLETADO';
  motivo?: string;
  observaciones?: string;
}