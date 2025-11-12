import { DatosMock } from '../types/guias.types';

/**
 * Datos MOCK (hardcodeados) que se usarán en todas las guías
 * Estos datos van BLOQUEADOS en el Excel (fondo gris)
 */
export const DATOS_MOCK: DatosMock = {
  remitente: {
    tipo_doc: 'Registro Unico de Contributentes',
    ruc: '20106897914',
    razon_social: 'ENTEL PERU S.A',
  },
  
  transportista: {
    tipo_doc: 'Registro Unico de Contributentes',
    ruc: '20600078098',
    razon_social: 'J&M SAMKA S.A.C',
  },
  
  motivo_traslado: {
    envio: 'Traslado entre establecimientos de la misma empresa',
    recojo: 'Otros',
  },
  
  descripcion_motivo: {
    envio: 'Envio de equipos informaticos',
    recojo: 'Recojo de equipos para mantenimiento',
  },
  
  punto_emision: 'T308-Envio eqps colaborador',
};

/**
 * Direcciones MOCK para puntos de partida/llegada fijos
 */
export const DIRECCIONES_MOCK = {
  origen_fijo: {
    ruc: '20106897914',
    direccion: 'Ca. Eduardo Lizarzaburu 554 - San Borja',
    ubigeo: '150101', // Lima - Lima - San Borja
  },
  
  destino_fijo: {
    ruc: '20106897914',
    razon_social: 'ENTEL PERU S.A',
    direccion: 'Ca. Eduardo Lizarzaburu 554 - San Borja',
  },
};

/**
 * Colores para el formato del Excel
 */
export const COLORES_EXCEL = {
  header: {
    fondo: 'FF4472C4', // Azul
    texto: 'FFFFFFFF', // Blanco
  },
  celda_bloqueada: {
    fondo: 'FFF0F0F0', // Gris claro
  },
  celda_editable: {
    fondo: 'FFFFFFFF', // Blanco
  },
};

/**
 * Configuración de columnas para la hoja Cabecera
 */
export const COLUMNAS_CABECERA = [
  'GRE_ID',
  'TipoDocRemit',
  'NroRucRemitente',
  'RazonSocialRemitente',
  'TipoDocDest',
  'NroRucDestinatario',
  'RazonSocialDestinatario',
  'MotivoTraslado',
  'DescripcionMotivoTraslado',
  'FechaInicioTraslado',
  'TipoDocTransp',
  'NroRucTransportista',
  'RazonSocialTransportista',
  'NroRucPuntoLlegada',
  'DireccionPuntoLlegada',
  'CodUbigeoPartida',
  'NroRucPuntoPartida',
  'DireccionPuntoPartida',
  'PuntoEmision',
  'NroOrden',
  'Observacion',
];

/**
 * Configuración de columnas para la hoja Detalle
 */
export const COLUMNAS_DETALLE = ['GRE_ID', 'Cantidad', 'Sku', 'Serie'];

/**
 * Índices de columnas EDITABLES en Cabecera según tipo de guía
 * (índices en base 1, como las columnas de Excel)
 */
export const COLUMNAS_EDITABLES = {
  envio: [10, 15, 20, 21], // FechaInicioTraslado, DireccionPuntoLlegada, NroOrden, Observacion
  recojo: [10, 16, 18, 20, 21], // FechaInicioTraslado, CodUbigeoPartida, DireccionPuntoPartida, NroOrden, Observacion
};

/**
 * Anchos de columnas para mejor visualización
 */
export const ANCHOS_COLUMNAS = {
  cabecera: 25, // Ancho por defecto para columnas de cabecera
  detalle: {
    gre_id: 15,
    cantidad: 15,
    sku: 20,
    serie: 200,
  },
};