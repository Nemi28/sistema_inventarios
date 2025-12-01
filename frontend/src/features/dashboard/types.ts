/**
 * Tipos e Interfaces para Dashboard v2
 * Sistema de Gestión de Inventarios
 * Enfocado en métricas operativas
 */

// ============================================
// RESPONSE GENÉRICA
// ============================================

export interface DashboardResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================
// KPIS DE EQUIPOS
// ============================================

export interface EquiposPorUbicacion {
  total: number;
  en_almacen: number;
  en_tiendas: number;
  en_personas: number;
  en_transito: number;
}

export interface EquiposPorEstado {
  operativo: number;
  por_validar: number;
  en_garantia: number;
  inoperativo: number;
  baja: number;
}

// ============================================
// ACTIVIDAD DE MOVIMIENTOS
// ============================================

export interface ActividadMovimientos {
  hoy: number;
  mes_actual: number;
  mes_anterior: number;
  porcentaje_crecimiento: number;
}

// ============================================
// ALERTAS OPERATIVAS
// ============================================

export interface AlertasOperativas {
  en_transito_largo: number;
  pendientes: number;
  sin_movimiento_30_dias: number;
  en_transito_total: number;
}

// ============================================
// GRÁFICOS
// ============================================

export interface MovimientoPorMes {
  mes: string;
  mes_nombre: string;
  cantidad: number;
}

export interface DistribucionUbicacion {
  ubicacion: string;
  cantidad: number;
  porcentaje: number;
}

export interface MovimientoPorTipo {
  tipo: string;
  tipo_label: string;
  cantidad: number;
}

export interface EquipoPorCategoria {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

export interface TopTiendaEquipos {
  tienda: string;
  pdv: string;
  socio: string;
  cantidad_equipos: number;
}

// ============================================
// TABLAS RECIENTES
// ============================================

export interface UltimoMovimiento {
  id: number;
  tipo_movimiento: string;
  tipo_label: string;
  estado_movimiento: string;
  ubicacion_origen: string;
  ubicacion_destino: string;
  persona_destino?: string;
  fecha_salida: string;
  codigo_acta?: string;
  numero_serie?: string;
  inv_entel?: string;
  modelo: string;
  marca: string;
  tienda_origen?: string;
  tienda_destino?: string;
  usuario: string;
}

export interface EquipoEnTransito {
  movimiento_id: number;
  tipo_movimiento: string;
  ubicacion_origen: string;
  ubicacion_destino: string;
  persona_destino?: string;
  fecha_salida: string;
  codigo_acta?: string;
  dias_en_transito: number;
  equipo_id: number;
  numero_serie?: string;
  inv_entel?: string;
  modelo: string;
  marca: string;
  tienda_origen?: string;
  tienda_destino?: string;
}

// ============================================
// RESUMEN DE CATÁLOGO
// ============================================

export interface StatsBase {
  total: number;
  activos: number;
}

export interface ResumenCatalogo {
  skus: StatsBase;
  tiendas: StatsBase;
  socios: StatsBase;
  categorias: StatsBase;
  marcas: StatsBase;
  modelos: StatsBase;
  ordenes: StatsBase;
}

export interface TiendasPorSocio {
  socio: string;
  cantidad: number;
}

// ============================================
// TIPO UNIVERSAL PARA DATOS DE GRÁFICOS (RECHARTS)
// ============================================

export interface DistribucionUbicacion {
  ubicacion: string;
  cantidad: number;
  porcentaje: number;
}

export interface EquiposPorCategoria {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}