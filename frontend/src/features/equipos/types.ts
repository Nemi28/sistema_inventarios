export interface Equipo {
  id: number;
  numero_serie?: string;
  inv_entel?: string;
  modelo_id: number;
  orden_compra_id?: number;
  tipo_propiedad: 'PROPIO' | 'ALQUILADO';
  fecha_compra?: string;
  garantia?: boolean;
  sistema_operativo?: string;
  estado_actual: 'OPERATIVO' | 'POR_VALIDAR' | 'EN_GARANTIA' | 'BAJA' | 'INOPERATIVO';
  ubicacion_actual: 'ALMACEN' | 'TIENDA' | 'PERSONA' | 'EN_TRANSITO';
  tienda_id?: number;
  hostname?: string;
  posicion_tienda?: string;
  area_tienda?: string;
  responsable_socio?: string;
  responsable_entel?: string;
  es_accesorio?: boolean;
  equipo_principal_id?: number;
  observaciones?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Datos de JOINs
  modelo_nombre?: string;
  marca_nombre?: string;
  categoria_nombre?: string;
  subcategoria_nombre?: string;
  tienda_nombre?: string;
  tienda_pdv?: string;
  orden_numero?: string;
  equipo_principal_serie?: string;
}

export interface EquipoFilters {
  activo?: boolean;
  modelo_id?: number;
  estado_actual?: string;
  ubicacion_actual?: string;
  tienda_id?: number;
  tipo_propiedad?: string;
  garantia?: boolean;
  es_accesorio?: boolean;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}