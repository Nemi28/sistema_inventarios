export interface Subcategoria {
  id: number;
  categoria_id: number;
  nombre: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  categoria_nombre?: string;
  total_modelos?: number;
}

export interface SubcategoriaFormData {
  categoria_id: number;
  nombre: string;
  activo: boolean;
}

export interface SubcategoriaFilters {
  activo?: boolean;
  categoria_id?: number;
  ordenar_por?: 'nombre' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}