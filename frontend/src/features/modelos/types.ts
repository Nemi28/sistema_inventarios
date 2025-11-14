export interface Modelo {
  id: number;
  subcategoria_id: number;
  marca_id: number;
  nombre: string;
  especificaciones_tecnicas?: Record<string, any>;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  subcategoria_nombre?: string;
  marca_nombre?: string;
  categoria_nombre?: string;
  categoria_id?: number;
}

export interface ModeloFormData {
  subcategoria_id: number;
  marca_id: number;
  nombre: string;
  especificaciones_tecnicas?: Record<string, any>;
  activo: boolean;
}

export interface ModeloFilters {
  activo?: boolean;
  subcategoria_id?: number;
  marca_id?: number;
  categoria_id?: number;
  ordenar_por?: 'nombre' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}