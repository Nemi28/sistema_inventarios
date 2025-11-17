import api from '@/services/api';
import {
  DashboardStats,
  ChartData,
  TiendasPorSocio,
  UltimoSKU,
  UltimaTienda,
  UltimaOrden,
  InventoryMetrics,
  CoverageMetrics,
  GrowthRate,
  TopCategoria,
  DistribucionEquipo,
  TopMarca,
  MatrizCoberturaResponse,
  UltimoModelo,
  AlertasIndicadores,
} from '../types';

// =============================================
// SERVICIOS EXISTENTES
// =============================================

export const obtenerStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<{ success: boolean; data: DashboardStats }>(
    '/api/dashboard/stats'
  );
  return data.data;
};

export const obtenerSkusPorMes = async (periodo?: number): Promise<ChartData[]> => {
  const { data } = await api.get<{ success: boolean; data: ChartData[] }>(
    '/api/dashboard/skus-por-mes',
    { params: { periodo: periodo || 6 } }
  );
  return data.data;
};

export const obtenerTiendasPorSocio = async (): Promise<TiendasPorSocio[]> => {
  const { data } = await api.get<{ success: boolean; data: TiendasPorSocio[] }>(
    '/api/dashboard/tiendas-por-socio'
  );
  return data.data;
};

export const obtenerOrdenesPorMes = async (periodo?: number): Promise<ChartData[]> => {
  const { data } = await api.get<{ success: boolean; data: ChartData[] }>(
    '/api/dashboard/ordenes-por-mes',
    { params: { periodo: periodo || 6 } }
  );
  return data.data;
};

export const obtenerUltimosSKUs = async (): Promise<UltimoSKU[]> => {
  const { data } = await api.get<{ success: boolean; data: UltimoSKU[] }>(
    '/api/dashboard/ultimos-skus'
  );
  return data.data;
};

export const obtenerUltimasTiendas = async (): Promise<UltimaTienda[]> => {
  const { data } = await api.get<{ success: boolean; data: UltimaTienda[] }>(
    '/api/dashboard/ultimas-tiendas'
  );
  return data.data;
};

export const obtenerUltimasOrdenes = async (): Promise<UltimaOrden[]> => {
  const { data } = await api.get<{ success: boolean; data: UltimaOrden[] }>(
    '/api/dashboard/ultimas-ordenes'
  );
  return data.data;
};

// =============================================
// SERVICIOS NUEVOS - MÉTRICAS
// =============================================

export const obtenerMetricasInventario = async (): Promise<InventoryMetrics> => {
  const { data } = await api.get<{ success: boolean; data: InventoryMetrics }>(
    '/api/dashboard/metricas-inventario'
  );
  return data.data;
};

export const obtenerMetricasCobertura = async (): Promise<CoverageMetrics> => {
  const { data } = await api.get<{ success: boolean; data: CoverageMetrics }>(
    '/api/dashboard/metricas-cobertura'
  );
  return data.data;
};

export const obtenerTasaCrecimiento = async (): Promise<GrowthRate> => {
  const { data } = await api.get<{ success: boolean; data: GrowthRate }>(
    '/api/dashboard/tasa-crecimiento'
  );
  return data.data;
};

// =============================================
// SERVICIOS NUEVOS - GRÁFICOS
// =============================================

export const obtenerModelosPorMes = async (periodo?: number): Promise<ChartData[]> => {
  const { data } = await api.get<{ success: boolean; data: ChartData[] }>(
    '/api/dashboard/modelos-por-mes',
    { params: { periodo: periodo || 6 } }
  );
  return data.data;
};

export const obtenerTopCategorias = async (limit?: number): Promise<TopCategoria[]> => {
  const { data } = await api.get<{ success: boolean; data: TopCategoria[] }>(
    '/api/dashboard/top-categorias',
    { params: { limit: limit || 10 } }
  );
  return data.data;
};

export const obtenerDistribucionEquipos = async (): Promise<DistribucionEquipo[]> => {
  const { data } = await api.get<{ success: boolean; data: DistribucionEquipo[] }>(
    '/api/dashboard/distribucion-equipos'
  );
  return data.data;
};

export const obtenerTopMarcas = async (
  limit?: number,
  categoriaId?: number
): Promise<TopMarca[]> => {
  const { data } = await api.get<{ success: boolean; data: TopMarca[] }>(
    '/api/dashboard/top-marcas',
    { params: { limit: limit || 10, categoria_id: categoriaId } }
  );
  return data.data;
};

export const obtenerMatrizCobertura = async (): Promise<MatrizCoberturaResponse> => {
  const { data } = await api.get<{ success: boolean; data: MatrizCoberturaResponse }>(
    '/api/dashboard/matriz-cobertura'
  );
  return data.data;
};

// =============================================
// SERVICIOS NUEVOS - ACTIVIDAD RECIENTE
// =============================================

export const obtenerUltimosModelos = async (limit?: number): Promise<UltimoModelo[]> => {
  const { data } = await api.get<{ success: boolean; data: UltimoModelo[] }>(
    '/api/dashboard/ultimos-modelos',
    { params: { limit: limit || 5 } }
  );
  return data.data;
};

// =============================================
// SERVICIOS NUEVOS - ALERTAS E INDICADORES
// =============================================

export const obtenerAlertasIndicadores = async (): Promise<AlertasIndicadores> => {
  const { data } = await api.get<{ success: boolean; data: AlertasIndicadores }>(
    '/api/dashboard/alertas-indicadores'
  );
  return data.data;
};