import api from '@/services/api';
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
  const { data } = await api.get<PaginatedResponse<Socio>>('/socios', { params });
  return data;
};

export const buscarSocios = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Socio>> => {
  const { data } = await api.get<PaginatedResponse<Socio>>('/socios/buscar', {
    params: { q: termino, page, limit },
  });
  return data;
};

export const obtenerSocio = async (id: number): Promise<Socio> => {
  const { data } = await api.get<{ success: boolean; data: Socio }>(
    `/socios/${id}`
  );
  return data.data;
};

export const crearSocio = async (
  socio: Omit<Socio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
): Promise<Socio> => {
  const { data } = await api.post<{ success: boolean; data: Socio }>(
    '/socios',
    socio
  );
  return data.data;
};

export const actualizarSocio = async (
  id: number,
  socio: Partial<Omit<Socio, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Socio> => {
  const { data } = await api.put<{ success: boolean; data: Socio }>(
    `/socios/${id}`,
    socio
  );
  return data.data;
};

export const eliminarSocio = async (id: number): Promise<void> => {
  await api.delete(`/socios/${id}`);
};

export const reactivarSocio = async (id: number): Promise<Socio> => {
  const { data } = await api.put<{ success: boolean; data: Socio }>(
    `/socios/${id}`,
    { activo: true }
  );
  return data.data;
};