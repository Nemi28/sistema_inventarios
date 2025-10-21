import api from '../../../services/api';
import { Socio } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarSociosParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  razon_social?: string;
  ruc?: string;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarSocios = async (
  params: ListarSociosParams = {}
): Promise<PaginatedResponse<Socio>> => {
  const { data } = await api.get<PaginatedResponse<Socio>>('/api/socios', { params });
  return data;
};

export const buscarSocios = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Socio>> => {
  const { data } = await api.get<PaginatedResponse<Socio>>('/api/socios/buscar', {
    params: { q: termino, page, limit },
  });
  return data;
};

export const obtenerSocio = async (id: number): Promise<Socio> => {
  const { data } = await api.get<{ success: boolean; data: Socio }>(
    `/api/socios/${id}`
  );
  return data.data;
};

export const crearSocio = async (
  socio: Omit<Socio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
): Promise<Socio> => {
  const { data } = await api.post<{ success: boolean; data: Socio }>(
    '/api/socios',
    socio
  );
  return data.data;
};

export const actualizarSocio = async (
  id: number,
  socio: Partial<Omit<Socio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Socio> => {
  const { data } = await api.put<{ success: boolean; data: Socio }>(
    `/api/socios/${id}`,
    socio
  );
  return data.data;
};

export const eliminarSocio = async (id: number): Promise<void> => {
  await api.delete(`/api/socios/${id}`);
};

export const reactivarSocio = async (id: number, datos: Partial<Socio>): Promise<Socio> => {
  const { data } = await api.put<{ success: boolean; data: Socio }>(
    `/api/socios/${id}`,
    { ...datos, activo: true }
  );
  console.log('📥 Respuesta del backend:', data);
  return data.data;
};