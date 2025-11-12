import { useQuery } from '@tanstack/react-query';
import {
  obtenerStats,
  obtenerSkusPorMes,
  obtenerTiendasPorSocio,
  obtenerOrdenesPorMes,
  obtenerUltimosSKUs,
  obtenerUltimasTiendas,
  obtenerUltimasOrdenes,
} from '../services/dashboard.service';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: obtenerStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useSkusPorMes = () => {
  return useQuery({
    queryKey: ['dashboard', 'skus-por-mes'],
    queryFn: obtenerSkusPorMes,
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

export const useOrdenesPorMes = () => {
  return useQuery({
    queryKey: ['dashboard', 'ordenes-por-mes'],
    queryFn: obtenerOrdenesPorMes,
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