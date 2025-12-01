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
} from '../services/dashboard.service';

// =============================================
// KPIS DE EQUIPOS
// =============================================

export const useEquiposPorUbicacion = () => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-ubicacion'],
    queryFn: obtenerEquiposPorUbicacion,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEquiposPorEstado = () => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-estado'],
    queryFn: obtenerEquiposPorEstado,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// ACTIVIDAD DE MOVIMIENTOS
// =============================================

export const useActividadMovimientos = () => {
  return useQuery({
    queryKey: ['dashboard', 'actividad-movimientos'],
    queryFn: obtenerActividadMovimientos,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// ALERTAS OPERATIVAS
// =============================================

export const useAlertasOperativas = () => {
  return useQuery({
    queryKey: ['dashboard', 'alertas-operativas'],
    queryFn: obtenerAlertasOperativas,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// GRÁFICOS
// =============================================

export const useMovimientosPorMes = (periodo: number) => {
  return useQuery({
    queryKey: ['dashboard', 'movimientos-por-mes', periodo],
    queryFn:()=> obtenerMovimientosPorMes(periodo),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDistribucionUbicacion = () => {
  return useQuery({
    queryKey: ['dashboard', 'distribucion-ubicacion'],
    queryFn: obtenerDistribucionUbicacion,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMovimientosPorTipo = () => {
  return useQuery({
    queryKey: ['dashboard', 'movimientos-por-tipo'],
    queryFn: obtenerMovimientosPorTipo,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEquiposPorCategoria = () => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-por-categoria'],
    queryFn: obtenerEquiposPorCategoria,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopTiendasEquipos = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-tiendas-equipos'],
    queryFn: obtenerTopTiendasEquipos,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// TABLAS RECIENTES
// =============================================

export const useUltimosMovimientos = () => {
  return useQuery({
    queryKey: ['dashboard', 'ultimos-movimientos'],
    queryFn: obtenerUltimosMovimientos,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEquiposEnTransito = () => {
  return useQuery({
    queryKey: ['dashboard', 'equipos-en-transito'],
    queryFn: obtenerEquiposEnTransito,
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
