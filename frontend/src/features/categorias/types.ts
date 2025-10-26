export interface Categoria {
  id: number;
  nombre: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CategoriaFormData {
  nombre: string;
  activo: boolean;
}

export interface CategoriaFilters {
  activo?: boolean;
  ordenar_por?: 'nombre' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}