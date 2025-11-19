import api from '../../../services/api';
import { OrdenCompra } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarOrdenesCompraParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  numero_orden?: string;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarOrdenesCompra = async (
  params: ListarOrdenesCompraParams = {}
): Promise<PaginatedResponse<OrdenCompra>> => {
  const { data } = await api.get<PaginatedResponse<OrdenCompra>>(
    '/api/ordenes-compra',
    { params }
  );
  return data;
};

export const buscarOrdenesCompra = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<OrdenCompra>> => {
  const { data } = await api.get<PaginatedResponse<OrdenCompra>>(
    '/api/ordenes-compra/buscar',
    {
      params: { q: termino, page, limit },
    }
  );
  return data;
};

export const obtenerOrdenCompra = async (id: number): Promise<OrdenCompra> => {
  const { data } = await api.get<{ success: boolean; data: OrdenCompra }>(
    `/api/ordenes-compra/${id}`
  );
  return data.data;
};

export const crearOrdenCompra = async (
  ordenCompra: Omit<OrdenCompra, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
): Promise<OrdenCompra> => {
  const { data } = await api.post<{ success: boolean; data: OrdenCompra }>(
    '/api/ordenes-compra',
    ordenCompra
  );
  return data.data;
};

export const actualizarOrdenCompra = async (
  id: number,
  ordenCompra: Partial<Omit<OrdenCompra, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<OrdenCompra> => {
  const { data } = await api.put<{ success: boolean; data: OrdenCompra }>(
    `/api/ordenes-compra/${id}`,
    ordenCompra
  );
  return data.data;
};

export const eliminarOrdenCompra = async (id: number): Promise<void> => {
  await api.delete(`/api/ordenes-compra/${id}`);
};

export const reactivarOrdenCompra = async (id: number): Promise<OrdenCompra> => {
  const { data } = await api.put<{ success: boolean; data: OrdenCompra }>(
    `/api/ordenes-compra/${id}`,
    { activo: true }
  );
  return data.data;
};

export const obtenerOrdenesCompra = async (): Promise<OrdenCompra[]> => {
  const { data } = await api.get<PaginatedResponse<OrdenCompra>>('/api/ordenes-compra', {
    params: { limit: 1000, activo: true }
  });
  return data.data;
};