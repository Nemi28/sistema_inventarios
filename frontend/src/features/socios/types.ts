export interface Socio {
  id: number;
  razon_social: string;
  ruc: string;
  direccion: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SocioFormData {
  razon_social: string;
  ruc: string;
  direccion: string;
  activo: boolean;
}

export interface SocioFilters {
  activo?: boolean;
  ordenar_por?: 'razon_social' | 'ruc' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}