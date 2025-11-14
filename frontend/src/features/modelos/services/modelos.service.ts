import api from '../../../services/api';
import { Modelo } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarModelosParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  nombre?: string;
  subcategoria_id?: number;
  marca_id?: number;
  categoria_id?: number;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarModelos = async (
  params: ListarModelosParams = {}
): Promise<PaginatedResponse<Modelo>> => {
  const { data } = await api.get<PaginatedResponse<Modelo>>('/api/modelos', { params });
  return data;
};

export const buscarModelos = async (
  termino: string,
  page = 1,
  limit = 20,
  filtros?: { subcategoria_id?: number; marca_id?: number; categoria_id?: number }
): Promise<PaginatedResponse<Modelo>> => {
  const { data } = await api.get<PaginatedResponse<Modelo>>('/api/modelos/buscar', {
    params: { q: termino, page, limit, ...filtros },
  });
  return data;
};

export const obtenerModelo = async (id: number): Promise<Modelo> => {
  const { data } = await api.get<{ success: boolean; data: Modelo }>(
    `/api/modelos/${id}`
  );
  return data.data;
};

export const obtenerModelosPorSubcategoria = async (subcategoriaId: number): Promise<Modelo[]> => {
  const { data } = await api.get<{ success: boolean; data: Modelo[] }>(
    `/api/modelos/subcategoria/${subcategoriaId}`
  );
  return data.data;
};

export const crearModelo = async (
  modelo: Omit<Modelo, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'subcategoria_nombre' | 'marca_nombre' | 'categoria_nombre' | 'categoria_id'>
): Promise<Modelo> => {
  const { data } = await api.post<{ success: boolean; data: Modelo }>(
    '/api/modelos',
    modelo
  );
  return data.data;
};

export const actualizarModelo = async (
  id: number,
  modelo: Partial<Omit<Modelo, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'subcategoria_nombre' | 'marca_nombre' | 'categoria_nombre' | 'categoria_id'>>
): Promise<Modelo> => {
  const { data } = await api.put<{ success: boolean; data: Modelo }>(
    `/api/modelos/${id}`,
    modelo
  );
  return data.data;
};

export const eliminarModelo = async (id: number): Promise<void> => {
  await api.delete(`/api/modelos/${id}`);
};

export const reactivarModelo = async (id: number): Promise<Modelo> => {
  const { data } = await api.put<{ success: boolean; data: Modelo }>(
    `/api/modelos/${id}`,
    { activo: true }
  );
  return data.data;
};

export const obtenerModelos = async (filtros?: { subcategoria_id?: number; marca_id?: number; categoria_id?: number }): Promise<Modelo[]> => {
  const { data } = await api.get<PaginatedResponse<Modelo>>('/api/modelos', {
    params: { limit: 1000, ...filtros }
  });
  return data.data;
};