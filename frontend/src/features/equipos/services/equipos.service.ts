import api from '@/services/api';
import { Equipo } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarEquiposParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  modelo_id?: number;
  categoria_id?: number;
  subcategoria_id?: number;
  marca_id?: number;
  estado_actual?: string;
  ubicacion_actual?: string;
  tienda_id?: number;
  tipo_propiedad?: string;
  garantia?: boolean;
  es_accesorio?: boolean;
  busqueda?: string; // ← NUEVO: Parámetro de búsqueda
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

export const listarEquipos = async (
  params: ListarEquiposParams = {}
): Promise<PaginatedResponse<Equipo>> => {
  const { data } = await api.get<PaginatedResponse<Equipo>>('/api/equipos', { 
    params 
  });
  return data;
};

export const buscarEquipos = async (
  termino: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Equipo>> => {
  const { data } = await api.get<PaginatedResponse<Equipo>>('/api/equipos/buscar', {
    params: { q: termino, page, limit },
  });
  return data;
};

export const obtenerEquipo = async (id: number): Promise<Equipo> => {
  const { data } = await api.get<{ success: boolean; data: Equipo }>(
    `/api/equipos/${id}`
  );
  return data.data;
};

export const crearEquipo = async (
  equipo: Omit<Equipo, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
): Promise<Equipo> => {
  const { data } = await api.post<{ success: boolean; data: Equipo }>(
    '/api/equipos',
    equipo
  );
  return data.data;
};

export const actualizarEquipo = async (
  id: number,
  equipo: Partial<Omit<Equipo, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>
): Promise<Equipo> => {
  const { data } = await api.put<{ success: boolean; data: Equipo }>(
    `/api/equipos/${id}`,
    equipo
  );
  return data.data;
};

export const eliminarEquipo = async (id: number): Promise<void> => {
  await api.delete(`/api/equipos/${id}`);
};

export const reactivarEquipo = async (
  id: number, 
  datos: Partial<Equipo>
): Promise<Equipo> => {
  const { data } = await api.put<{ success: boolean; data: Equipo }>(
    `/api/equipos/${id}`,
    { ...datos, activo: true }
  );
  return data.data;
};

export const obtenerEquipos = async (): Promise<Equipo[]> => {
  const { data } = await api.get<PaginatedResponse<Equipo>>('/api/equipos', {
    params: { limit: 1000 }
  });
  return data.data;
};

/**
 * Obtener equipos en ALMACÉN
 */
export const listarEquiposAlmacen = async (
  params: ListarEquiposParams = {}
): Promise<PaginatedResponse<Equipo>> => {
  const { data } = await api.get<PaginatedResponse<Equipo>>('/api/equipos/almacen', { 
    params 
  });
  return data;
};

/**
 * Obtener equipos en TIENDAS
 */
export const listarEquiposTiendas = async (
  params: ListarEquiposParams = {}
): Promise<PaginatedResponse<Equipo>> => {
  const { data } = await api.get<PaginatedResponse<Equipo>>('/api/equipos/tiendas', { 
    params 
  });
  return data;
};

/**
 * Obtener equipos asignados a PERSONAS
 */
export const listarEquiposPersonas = async (
  params: ListarEquiposParams = {}
): Promise<PaginatedResponse<Equipo>> => {
  const { data } = await api.get<PaginatedResponse<Equipo>>('/api/equipos/personas', { 
    params 
  });
  return data;
};
