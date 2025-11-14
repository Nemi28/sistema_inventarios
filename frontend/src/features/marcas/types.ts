export interface Marca {
  id: number;
  nombre: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  total_modelos?: number;
}

export interface MarcaFormData {
  nombre: string;
  activo: boolean;
}

export interface MarcaFilters {
  activo?: boolean;
  ordenar_por?: 'nombre' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}