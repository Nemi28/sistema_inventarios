import api from '../../../services/api';
import { Categoria } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarCategoriasParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  nombre?: string;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarCategorias = async (
  params: ListarCategoriasParams = {}
): Promise<PaginatedResponse<Categoria>> => {
  const { data } = await api.get<PaginatedResponse<Categoria>>('/api/categorias', { params });
  return data;
};

export const buscarCategorias = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Categoria>> => {
  const { data } = await api.get<PaginatedResponse<Categoria>>('/api/categorias/buscar', {
    params: { q: termino, page, limit },
  });
  return data;
};

export const obtenerCategoria = async (id: number): Promise<Categoria> => {
  const { data } = await api.get<{ success: boolean; data: Categoria }>(
    `/api/categorias/${id}`
  );
  return data.data;
};

export const crearCategoria = async (
  categoria: Omit<Categoria, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
): Promise<Categoria> => {
  const { data } = await api.post<{ success: boolean; data: Categoria }>(
    '/api/categorias',
    categoria
  );
  return data.data;
};

export const actualizarCategoria = async (
  id: number,
  categoria: Partial<Omit<Categoria, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Categoria> => {
  const { data } = await api.put<{ success: boolean; data: Categoria }>(
    `/api/categorias/${id}`,
    categoria
  );
  return data.data;
};

export const eliminarCategoria = async (id: number): Promise<void> => {
  await api.delete(`/api/categorias/${id}`);
};

export const reactivarCategoria = async (id: number): Promise<Categoria> => {
  const { data } = await api.put<{ success: boolean; data: Categoria }>(
    `/api/categorias/${id}`,
    { activo: true }
  );
  return data.data;
};
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get<PaginatedResponse<Categoria>>('/api/categorias', {
    params: { limit: 1000 } // Obtener todas las categorías
  });
  return data.data;
};
