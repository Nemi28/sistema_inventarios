import api from '@/services/api';
import { SKU } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarSKUsParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  codigo_sku?: string;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarSKUs = async (
  params: ListarSKUsParams = {}
): Promise<PaginatedResponse<SKU>> => {
  const { data } = await api.get<PaginatedResponse<SKU>>('/skus', { params });
  return data;
};

export const buscarSKUs = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<SKU>> => {
  const { data } = await api.get<PaginatedResponse<SKU>>('/skus/buscar', {
    params: { q: termino, page, limit },
  });
  return data;
};

export const obtenerSKU = async (id: number): Promise<SKU> => {
  const { data } = await api.get<{ success: boolean; data: SKU }>(
    `/skus/${id}`
  );
  return data.data;
};

export const crearSKU = async (
  sku: Omit<SKU, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
): Promise<SKU> => {
  const { data } = await api.post<{ success: boolean; data: SKU }>(
    '/skus',
    sku
  );
  return data.data;
};

export const actualizarSKU = async (
  id: number,
  sku: Partial<Omit<SKU, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<SKU> => {
  const { data } = await api.put<{ success: boolean; data: SKU }>(
    `/skus/${id}`,
    sku
  );
  return data.data;
};

export const eliminarSKU = async (id: number): Promise<void> => {
  await api.delete(`/skus/${id}`);
};

export const reactivarSKU = async (id: number): Promise<SKU> => {
  const { data } = await api.put<{ success: boolean; data: SKU }>(
    `/skus/${id}`,
    { activo: true }
  );
  return data.data;
};