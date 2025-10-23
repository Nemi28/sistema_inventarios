export type TipoGuia = 'envio' | 'recojo';

export interface GuiaRequestDTO {
  tipo: TipoGuia;
  fecha_inicio_traslado: string; // formato: DD/MM/YYYY
  tienda_id: number;
  nro_orden: string;
  observacion?: string;
  detalle: DetalleSkuDTO[];
}

export interface DetalleSkuDTO {
  cantidad: number;
  sku_id: number;
  serie?: string;
}

export interface TiendaData {
  id: number;
  pdv: string;
  nombre_tienda: string;
  socio_id: number;
  socio_ruc: string;
  socio_razon_social: string;
  direccion: string;
  ubigeo: string;
  activo: boolean;
}

export interface SKUData {
  id: number;
  codigo_sku: string;
  descripcion_sku: string;
  activo: boolean;
}

export interface DatosMock {
  remitente: {
    tipo_doc: string;
    ruc: string;
    razon_social: string;
  };
  transportista: {
    tipo_doc: string;
    ruc: string;
    razon_social: string;
  };
  motivo_traslado: {
    envio: string;
    recojo: string;
  };
  descripcion_motivo: {
    envio: string;
    recojo: string;
  };
  punto_emision: string;
}

export interface CabeceraExcel {
  GRE_ID: number;
  TipoDocRemit: string;
  NroRucRemitente: string;
  RazonSocialRemitente: string;
  TipoDocDest: string;
  NroRucDestinatario: string;
  RazonSocialDestinatario: string;
  MotivoTraslado: string;
  DescripcionMotivoTraslado: string;
  FechaInicioTraslado: string;
  TipoDocTransp: string;
  NroRucTransportista: string;
  RazonSocialTransportista: string;
  NroRucPuntoLlegada: string;
  DireccionPuntoLlegada: string;
  CodUbigeoPartida: string;
  NroRucPuntoPartida: string;
  DireccionPuntoPartida: string;
  PuntoEmision: string;
  NroOrden: string;
  Observacion: string;
}

export interface DetalleExcel {
  GRE_ID: number;
  Cantidad: number;
  Sku: string;
  Serie: string;
}