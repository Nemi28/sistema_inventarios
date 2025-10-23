export type TipoGuia = 'envio' | 'recojo';

export interface GuiaFormData {
  tipo: TipoGuia;
  fecha_inicio_traslado: string; // formato: YYYY-MM-DD (input date)
  tienda_id: number;
  nro_orden: string;
  observacion?: string;
  detalle: DetalleSkuItem[];
}

export interface DetalleSkuItem {
  cantidad: number;
  sku_id: number;
  serie?: string;
}

export interface Tienda {
  id: number;
  pdv: string;
  nombre_tienda: string;
  direccion: string;
  ubigeo: string;
  socio_razon_social: string;
}

export interface SKU {
  id: number;
  codigo_sku: string;
  descripcion_sku: string;
}

export interface GenerarGuiaRequest {
  tipo: TipoGuia;
  fecha_inicio_traslado: string; // formato: DD/MM/YYYY (para backend)
  tienda_id: number;
  nro_orden: string;
  observacion?: string;
  detalle: DetalleSkuItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}