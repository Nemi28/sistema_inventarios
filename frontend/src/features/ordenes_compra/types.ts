export interface OrdenCompra {
  id: number;
  numero_orden: string;
  detalle: string | null;
  fecha_ingreso: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface OrdenCompraFormData {
  numero_orden: string;
  detalle?: string | null;
  fecha_ingreso: string;
  activo: boolean;
}

export interface OrdenCompraFilters {
  activo?: boolean;
  ordenar_por?: 'numero_orden' | 'fecha_ingreso' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}