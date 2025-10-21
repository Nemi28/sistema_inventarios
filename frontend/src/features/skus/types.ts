export interface SKU {
  id: number;
  codigo_sku: string;
  descripcion_sku: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SKUFormData {
  codigo_sku: string;
  descripcion_sku: string;
  activo: boolean;
}

export interface SKUFilters {
  activo?: boolean;
  ordenar_por?: 'codigo_sku' | 'descripcion_sku' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}