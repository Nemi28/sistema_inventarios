import api from '@/services/api';
import { Tienda } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarTiendasParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  socio_id?: number;
  tipo_local?: string;
  perfil_local?: string;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarTiendas = async (
  params: ListarTiendasParams = {}
): Promise<PaginatedResponse<Tienda>> => {
  const { data } = await api.get<PaginatedResponse<Tienda>>('/api/tiendas', { 
    params 
  });
  return data;
};

export const buscarTiendas = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Tienda>> => {
  const { data } = await api.get<PaginatedResponse<Tienda>>('/api/tiendas/buscar', {
    params: { q: termino, page, limit },
  });
  return data;
};

export const obtenerTienda = async (id: number): Promise<Tienda> => {
  const { data } = await api.get<{ success: boolean; data: Tienda }>(
    `/api/tiendas/${id}`
  );
  return data.data;
};

export const crearTienda = async (
  tienda: Omit<Tienda, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
): Promise<Tienda> => {
  const { data } = await api.post<{ success: boolean; data: Tienda }>(
    '/api/tiendas',
    tienda
  );
  return data.data;
};

export const actualizarTienda = async (
  id: number,
  tienda: Partial<Omit<Tienda, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Tienda> => {
  const { data } = await api.put<{ success: boolean; data: Tienda }>(
    `/api/tiendas/${id}`,
    tienda
  );
  return data.data;
};

export const eliminarTienda = async (id: number): Promise<void> => {
  await api.delete(`/api/tiendas/${id}`);
};

export const reactivarTienda = async (
  id: number, 
  datos: Partial<Tienda>
): Promise<Tienda> => {
  const { data } = await api.put<{ success: boolean; data: Tienda }>(
    `/api/tiendas/${id}`,
    { ...datos, activo: true }
  );
  console.log('📥 Respuesta del backend:', data);
  return data.data;
};