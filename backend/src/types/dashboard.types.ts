/**
 * Tipos e Interfaces para Dashboard Completo
 * Sistema de Gestión de Inventarios
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
// MÉTRICAS PRINCIPALES (YA EXISTENTES)
// ============================================

export interface StatsBase {
  total: number;
  activos: number;
}

export interface DashboardStats {
  skus: StatsBase;
  tiendas: StatsBase;
  socios: StatsBase;
  ordenes: StatsBase;
  categorias: StatsBase;
}

// ============================================
// MÉTRICAS ADICIONALES DE INVENTARIO (NUEVAS)
// ============================================

export interface InventoryMetrics {
  modelos: StatsBase;
  marcas: StatsBase;
  subcategorias: StatsBase;
  promedioModelosPorMarca: number;
  promedioTiendasPorSocio: number;
}

// ============================================
// MÉTRICAS DE COBERTURA (NUEVAS)
// ============================================

export interface CoverageMetrics {
  sociosConTiendas: number;
  sociosSinTiendas: number;
  categoriasConModelos: number;
  categoriasSinModelos: number;
  porcentajeCoberturaCatalogo: number;
}

// ============================================
// TASA DE CRECIMIENTO (NUEVAS)
// ============================================

export interface MesComparacion {
  mesActual: number;
  mesAnterior: number;
  porcentajeCrecimiento: number;
}

export interface GrowthRate {
  skus: MesComparacion;
  ordenes: MesComparacion;
  modelos: MesComparacion;
}

// ============================================
// DATOS PARA GRÁFICOS TEMPORALES (YA EXISTENTES)
// ============================================

export interface ChartDataMensual {
  mes: string;
  mes_nombre: string;
  cantidad: number;
}

// SKUs por mes (ya existe)
export type SkusPorMes = ChartDataMensual[];

// Órdenes por mes (ya existe)
export type OrdenesPorMes = ChartDataMensual[];

// Modelos por mes (NUEVA)
export type ModelosPorMes = ChartDataMensual[];

// ============================================
// TIENDAS POR SOCIO (YA EXISTE)
// ============================================

export interface TiendasPorSocio {
  socio: string;
  cantidad: number;
}

// ============================================
// GRÁFICOS NUEVOS - TOP CATEGORÍAS
// ============================================

export interface TopCategoria {
  categoria: string;
  cantidad_modelos: number;
  porcentaje: number;
}

// ============================================
// GRÁFICOS NUEVOS - DISTRIBUCIÓN EQUIPOS
// ============================================

export interface DistribucionEquipo {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

// ============================================
// GRÁFICOS NUEVOS - TOP MARCAS
// ============================================

export interface TopMarca {
  marca: string;
  cantidad_modelos: number;
  categorias_cubiertas: number;
}

// ============================================
// GRÁFICOS NUEVOS - MATRIZ COBERTURA
// ============================================

export interface MatrizCobertura {
  marca: string;
  [categoria: string]: number | string; // Permite columnas dinámicas
}

// ============================================
// ACTIVIDAD RECIENTE - ÚLTIMOS SKUS (YA EXISTE - MEJORADO)
// ============================================

export interface UltimoSKU {
  codigo_sku: string;
  descripcion_sku: string;
  activo: boolean;
  fecha_creacion: Date;
}

// Versión mejorada con días y categoría
export interface UltimoSKUEnhanced extends UltimoSKU {
  categoria?: string;
  dias_desde_creacion: number;
}

// ============================================
// ACTIVIDAD RECIENTE - ÚLTIMAS TIENDAS (YA EXISTE)
// ============================================

export interface UltimaTienda {
  pdv: string;
  nombre_tienda: string;
  socio: string;
  activo: boolean;
  fecha_creacion: Date;
}

// ============================================
// ACTIVIDAD RECIENTE - ÚLTIMAS ÓRDENES (YA EXISTE - MEJORADO)
// ============================================

export interface UltimaOrden {
  numero_orden: string;
  detalle: string;
  fecha_ingreso: Date;
  activo: boolean;
  fecha_creacion: Date;
}

// Versión mejorada con días desde ingreso
export interface UltimaOrdenEnhanced extends UltimaOrden {
  dias_desde_ingreso: number;
}

// ============================================
// ACTIVIDAD RECIENTE - ÚLTIMOS MODELOS (NUEVA)
// ============================================

export interface UltimoModelo {
  nombre: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  fecha_creacion: Date;
  activo: boolean;
  es_nuevo: boolean; // true si tiene menos de 7 días
}

// ============================================
// ALERTAS E INDICADORES (NUEVAS)
// ============================================

export interface Alertas {
  categoriasVacias: number;
  sociosSinTiendas: number;
  marcasSinModelos: number;
}

export interface Indicadores {
  tasaCompletitudCatalogo: number;    // % de categorías con modelos
  concentracionTopMarcas: number;     // % de modelos en top 3 marcas
  diversidadCatalogo: number;         // Número de marcas diferentes
}

export interface AlertasIndicadores {
  alertas: Alertas;
  indicadores: Indicadores;
}

// ============================================
// FILTROS
// ============================================

export interface FiltrosDashboard {
  periodo?: 3 | 6 | 12; // meses
  categoria_id?: number;
  limit?: number;
}