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
  es_accesorio?: boolean;
  equipo_principal_id?: number;
  observaciones?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Datos de JOINs - Originales
  modelo_nombre?: string;
  marca_nombre?: string;
  categoria_nombre?: string;
  subcategoria_nombre?: string;
  tienda_nombre?: string;
  tienda_pdv?: string;
  orden_numero?: string;
  equipo_principal_serie?: string;
  equipo_principal_inv_entel?: string;
  equipo_principal_modelo?: string;
  accesorios_count?: number;
  // Datos para Vista ALMACÉN
  ultima_ubicacion_origen?: string;
  
  // Datos para Vista TIENDAS
  nombre_tienda?: string;
  pdv?: string;
  socio_nombre?: string;
  // Responsables ahora vienen de la tienda (JOIN)
  responsable_socio?: string;
  responsable_entel?: string;
  
  // Datos para Vista PERSONAS
  persona_asignada?: string;
  fecha_asignacion?: string;
  codigo_acta?: string;
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