export interface Tienda {
  id: number;
  pdv: string;
  tipo_local: string;
  perfil_local: string;
  nombre_tienda: string;
  socio_id: number;
  direccion: string;
  ubigeo: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Datos del JOIN con socio
  socio_razon_social?: string;
  socio_ruc?: string;
}

export interface TiendaFormData {
  pdv: string;
  tipo_local: string;
  perfil_local: string;
  nombre_tienda: string;
  socio_id: number;
  direccion: string;
  ubigeo: string;
  activo: boolean;
}

export interface TiendaFilters {
  activo?: boolean;
  socio_id?: number;
  perfil_local?: string;
  ordenar_por?: 'pdv' | 'nombre_tienda' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}