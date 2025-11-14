import api from '../../../services/api';
import { Marca } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarMarcasParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  nombre?: string;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarMarcas = async (
  params: ListarMarcasParams = {}
): Promise<PaginatedResponse<Marca>> => {
  const { data } = await api.get<PaginatedResponse<Marca>>('/api/marcas', { params });
  return data;
};

export const buscarMarcas = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Marca>> => {
  const { data } = await api.get<PaginatedResponse<Marca>>('/api/marcas/buscar', {
    params: { q: termino, page, limit },
  });
  return data;
};

export const obtenerMarca = async (id: number): Promise<Marca> => {
  const { data } = await api.get<{ success: boolean; data: Marca }>(
    `/api/marcas/${id}`
  );
  return data.data;
};

export const obtenerMarcasActivas = async (): Promise<Marca[]> => {
  const { data } = await api.get<{ success: boolean; data: Marca[] }>(
    '/api/marcas/activas'
  );
  return data.data;
};

export const crearMarca = async (
  marca: Omit<Marca, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'total_modelos'>
): Promise<Marca> => {
  const { data } = await api.post<{ success: boolean; data: Marca }>(
    '/api/marcas',
    marca
  );
  return data.data;
};

export const actualizarMarca = async (
  id: number,
  marca: Partial<Omit<Marca, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'total_modelos'>>
): Promise<Marca> => {
  const { data } = await api.put<{ success: boolean; data: Marca }>(
    `/api/marcas/${id}`,
    marca
  );
  return data.data;
};

export const eliminarMarca = async (id: number): Promise<void> => {
  await api.delete(`/api/marcas/${id}`);
};

export const reactivarMarca = async (id: number): Promise<Marca> => {
  const { data } = await api.put<{ success: boolean; data: Marca }>(
    `/api/marcas/${id}`,
    { activo: true }
  );
  return data.data;
};

export const obtenerMarcas = async (): Promise<Marca[]> => {
  const { data } = await api.get<PaginatedResponse<Marca>>('/api/marcas', {
    params: { limit: 1000 }
  });
  return data.data;
};