import { useQuery } from '@tanstack/react-query';
import {
  obtenerStats,
  obtenerSkusPorMes,
  obtenerTiendasPorSocio,
  obtenerOrdenesPorMes,
  obtenerUltimosSKUs,
  obtenerUltimasTiendas,
  obtenerUltimasOrdenes,
  obtenerMetricasInventario,
  obtenerMetricasCobertura,
  obtenerTasaCrecimiento,
  obtenerModelosPorMes,
  obtenerTopCategorias,
  obtenerDistribucionEquipos,
  obtenerTopMarcas,
  obtenerMatrizCobertura,
  obtenerUltimosModelos,
  obtenerAlertasIndicadores,
} from '../services/dashboard.service';

// =============================================
// HOOKS EXISTENTES
// =============================================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: obtenerStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useSkusPorMes = (periodo?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'skus-por-mes', periodo],
    queryFn: () => obtenerSkusPorMes(periodo),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTiendasPorSocio = () => {
  return useQuery({
    queryKey: ['dashboard', 'tiendas-por-socio'],
    queryFn: obtenerTiendasPorSocio,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrdenesPorMes = (periodo?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'ordenes-por-mes', periodo],
    queryFn: () => obtenerOrdenesPorMes(periodo),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUltimosSKUs = () => {
  return useQuery({
    queryKey: ['dashboard', 'ultimos-skus'],
    queryFn: obtenerUltimosSKUs,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUltimasTiendas = () => {
  return useQuery({
    queryKey: ['dashboard', 'ultimas-tiendas'],
    queryFn: obtenerUltimasTiendas,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUltimasOrdenes = () => {
  return useQuery({
    queryKey: ['dashboard', 'ultimas-ordenes'],
    queryFn: obtenerUltimasOrdenes,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// HOOKS NUEVOS - MÉTRICAS
// =============================================

export const useMetricasInventario = () => {
  return useQuery({
    queryKey: ['dashboard', 'metricas-inventario'],
    queryFn: obtenerMetricasInventario,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMetricasCobertura = () => {
  return useQuery({
    queryKey: ['dashboard', 'metricas-cobertura'],
    queryFn: obtenerMetricasCobertura,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTasaCrecimiento = () => {
  return useQuery({
    queryKey: ['dashboard', 'tasa-crecimiento'],
    queryFn: obtenerTasaCrecimiento,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// HOOKS NUEVOS - GRÁFICOS
// =============================================

export const useModelosPorMes = (periodo?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'modelos-por-mes', periodo],
    queryFn: () => obtenerModelosPorMes(periodo),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopCategorias = (limit?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'top-categorias', limit],
    queryFn: () => obtenerTopCategorias(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDistribucionEquipos = () => {
  return useQuery({
    queryKey: ['dashboard', 'distribucion-equipos'],
    queryFn: obtenerDistribucionEquipos,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopMarcas = (limit?: number, categoriaId?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'top-marcas', limit, categoriaId],
    queryFn: () => obtenerTopMarcas(limit, categoriaId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMatrizCobertura = () => {
  return useQuery({
    queryKey: ['dashboard', 'matriz-cobertura'],
    queryFn: obtenerMatrizCobertura,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// HOOKS NUEVOS - ACTIVIDAD RECIENTE
// =============================================

export const useUltimosModelos = (limit?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'ultimos-modelos', limit],
    queryFn: () => obtenerUltimosModelos(limit),
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// HOOKS NUEVOS - ALERTAS E INDICADORES
// =============================================

export const useAlertasIndicadores = () => {
  return useQuery({
    queryKey: ['dashboard', 'alertas-indicadores'],
    queryFn: obtenerAlertasIndicadores,
    staleTime: 5 * 60 * 1000,
  });
};