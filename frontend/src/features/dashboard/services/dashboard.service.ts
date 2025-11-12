import api from '@/services/api';
import {
  DashboardStats,
  ChartData,
  TiendasPorSocio,
  UltimoSKU,
  UltimaTienda,
  UltimaOrden,
} from '../types';

export const obtenerStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<{ success: boolean; data: DashboardStats }>(
    '/api/dashboard/stats'
  );
  return data.data;
};

export const obtenerSkusPorMes = async (): Promise<ChartData[]> => {
  const { data } = await api.get<{ success: boolean; data: ChartData[] }>(
    '/api/dashboard/skus-por-mes'
  );
  return data.data;
};

export const obtenerTiendasPorSocio = async (): Promise<TiendasPorSocio[]> => {
  const { data } = await api.get<{ success: boolean; data: TiendasPorSocio[] }>(
    '/api/dashboard/tiendas-por-socio'
  );
  return data.data;
};

export const obtenerOrdenesPorMes = async (): Promise<ChartData[]> => {
  const { data } = await api.get<{ success: boolean; data: ChartData[] }>(
    '/api/dashboard/ordenes-por-mes'
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