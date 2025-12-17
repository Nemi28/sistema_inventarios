import { useQuery } from '@tanstack/react-query';
import {
  obtenerEquiposPorUbicacion,
  obtenerEquiposPorEstado,
  obtenerActividadMovimientos,
  obtenerAlertasOperativas,
  obtenerMovimientosPorMes,
  obtenerDistribucionUbicacion,
  obtenerMovimientosPorTipo,
  obtenerEquiposPorCategoria,
  obtenerTopTiendasEquipos,
  obtenerUltimosMovimientos,
  obtenerEquiposEnTransito,
  obtenerResumenCatalogo,
  obtenerTiendasPorSocio,
  obtenerLaptopsPorPropiedad,
  obtenerSociosLista,
  obtenerSubcategoriasLista,
} from '../services/dashboard.service';
import { DashboardFiltros } from '../types';

// =============================================
// LISTAS PARA FILTROS
// =============================================

export const useSociosLista = () => {
  return useQuery({
    queryKey: ['dashboard', 'socios-lista'],
    queryFn: obtenerSociosLista,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSubcategoriasLista = () => {
  return useQuery({
    queryKey: ['dashboard', 'subcategorias-lista'],
    queryFn: obtenerSubcategoriasLista,
    staleTime: 10 * 60 * 1000,
  });
};

// =============================================
// KPIS DE EQUIPOS
// =============================================

export const useEquiposPorUbicacion = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-ubicacion', filtros],
    queryFn: () => obtenerEquiposPorUbicacion(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEquiposPorEstado = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-estado', filtros],
    queryFn: () => obtenerEquiposPorEstado(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLaptopsPorPropiedad = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'laptops-propiedad', filtros],
    queryFn: () => obtenerLaptopsPorPropiedad(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// ACTIVIDAD DE MOVIMIENTOS
// =============================================

export const useActividadMovimientos = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'actividad-movimientos', filtros],
    queryFn: () => obtenerActividadMovimientos(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// ALERTAS OPERATIVAS
// =============================================

export const useAlertasOperativas = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'alertas-operativas', filtros],
    queryFn: () => obtenerAlertasOperativas(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// GRÁFICOS
// =============================================

export const useMovimientosPorMes = (periodo: number, filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'movimientos-por-mes', periodo, filtros],
    queryFn: () => obtenerMovimientosPorMes(periodo, filtros),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDistribucionUbicacion = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'distribucion-ubicacion', filtros],
    queryFn: () => obtenerDistribucionUbicacion(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMovimientosPorTipo = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'movimientos-por-tipo', filtros],
    queryFn: () => obtenerMovimientosPorTipo(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEquiposPorCategoria = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-por-categoria', filtros],
    queryFn: () => obtenerEquiposPorCategoria(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopTiendasEquipos = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'top-tiendas-equipos', filtros],
    queryFn: () => obtenerTopTiendasEquipos(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// TABLAS RECIENTES
// =============================================

export const useUltimosMovimientos = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'ultimos-movimientos', filtros],
    queryFn: () => obtenerUltimosMovimientos(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEquiposEnTransito = (filtros?: DashboardFiltros) => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-en-transito', filtros],
    queryFn: () => obtenerEquiposEnTransito(filtros),
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// RESUMEN DE CATÁLOGO
// =============================================

export const useResumenCatalogo = () => {
  return useQuery({
    queryKey: ['dashboard', 'resumen-catalogo'],
    queryFn: obtenerResumenCatalogo,
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
