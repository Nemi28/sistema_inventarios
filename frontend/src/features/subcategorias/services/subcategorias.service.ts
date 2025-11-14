import api from '../../../services/api';
import { Subcategoria } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarSubcategoriasParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  nombre?: string;
  categoria_id?: number;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarSubcategorias = async (
  params: ListarSubcategoriasParams = {}
): Promise<PaginatedResponse<Subcategoria>> => {
  const { data } = await api.get<PaginatedResponse<Subcategoria>>('/api/subcategorias', { params });
  return data;
};

export const buscarSubcategorias = async (
  termino: string,
  page = 1,
  limit = 20,
  categoria_id?: number
): Promise<PaginatedResponse<Subcategoria>> => {
  const { data } = await api.get<PaginatedResponse<Subcategoria>>('/api/subcategorias/buscar', {
    params: { q: termino, page, limit, categoria_id },
  });
  return data;
};

export const obtenerSubcategoria = async (id: number): Promise<Subcategoria> => {
  const { data } = await api.get<{ success: boolean; data: Subcategoria }>(
    `/api/subcategorias/${id}`
  );
  return data.data;
};

export const obtenerSubcategoriasPorCategoria = async (categoriaId: number): Promise<Subcategoria[]> => {
  const { data } = await api.get<{ success: boolean; data: Subcategoria[] }>(
    `/api/subcategorias/categoria/${categoriaId}`
  );
  return data.data;
};

export const crearSubcategoria = async (
  subcategoria: Omit<Subcategoria, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'categoria_nombre' | 'total_modelos'>
): Promise<Subcategoria> => {
  const { data } = await api.post<{ success: boolean; data: Subcategoria }>(
    '/api/subcategorias',
    subcategoria
  );
  return data.data;
};

export const actualizarSubcategoria = async (
  id: number,
  subcategoria: Partial<Omit<Subcategoria, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'categoria_nombre' | 'total_modelos'>>
): Promise<Subcategoria> => {
  const { data } = await api.put<{ success: boolean; data: Subcategoria }>(
    `/api/subcategorias/${id}`,
    subcategoria
  );
  return data.data;
};

export const eliminarSubcategoria = async (id: number): Promise<void> => {
  await api.delete(`/api/subcategorias/${id}`);
};

export const reactivarSubcategoria = async (id: number): Promise<Subcategoria> => {
  const { data } = await api.put<{ success: boolean; data: Subcategoria }>(
    `/api/subcategorias/${id}`,
    { activo: true }
  );
  return data.data;
};

export const obtenerSubcategorias = async (categoriaId?: number): Promise<Subcategoria[]> => {
  const params: any = { limit: 1000 };
  if (categoriaId) {
    params.categoria_id = categoriaId;
  }
  
  const { data } = await api.get<PaginatedResponse<Subcategoria>>('/api/subcategorias', {
    params
  });
  return data.data;
};