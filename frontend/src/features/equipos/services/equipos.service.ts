import api from '@/services/api';
import { Equipo, EquipoFormData } from '../types';
import { PaginatedResponse } from '@/types/api.types';

export interface ListarEquiposParams {
  page?: number;
  limit?: number;
  activo?: boolean;
  categoria_id?: number;
  orden_compra_id?: number;
  estado?: string;
  ordenar_por?: string;
  orden?: 'ASC' | 'DESC';
}

/**
 * Listar equipos con paginación y filtros
 */
export const listarEquipos = async (
  params: ListarEquiposParams = {}
): Promise<PaginatedResponse<Equipo>> => {
  const { data } = await api.get<PaginatedResponse<Equipo>>('/api/equipos', {
    params,
  });
  return data;
};

/**
 * Buscar equipos por término
 */
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

/**
 * Obtener equipo por ID
 */
export const obtenerEquipo = async (id: number): Promise<Equipo> => {
  const { data } = await api.get<{ success: boolean; data: Equipo }>(
    `/api/equipos/${id}`
  );
  return data.data;
};

/**
 * Crear equipo individual
 */
export const crearEquipo = async (
  equipo: EquipoFormData
): Promise<Equipo> => {
  const { data } = await api.post<{ success: boolean; data: Equipo }>(
    '/api/equipos',
    equipo
  );
  return data.data;
};

/**
 * Crear múltiples equipos (hasta 50)
 */
export const crearEquiposMultiple = async (
  equipos: EquipoFormData[]
): Promise<{ cantidad: number; ids: number[] }> => {
  const { data } = await api.post<{
    success: boolean;
    data: { cantidad: number; ids: number[] };
  }>('/api/equipos/multiple', { equipos });
  return data.data;
};

/**
 * Actualizar equipo
 */
export const actualizarEquipo = async (
  id: number,
  equipo: Partial<EquipoFormData>
): Promise<Equipo> => {
  const { data } = await api.put<{ success: boolean; data: Equipo }>(
    `/api/equipos/${id}`,
    equipo
  );
  return data.data;
};

/**
 * Eliminar equipo (soft delete)
 */
export const eliminarEquipo = async (id: number): Promise<void> => {
  await api.delete(`/api/equipos/${id}`);
};

/**
 * Reactivar equipo
 */
export const reactivarEquipo = async (
  id: number,
  datos: Partial<Equipo>
): Promise<Equipo> => {
  const { data } = await api.put<{ success: boolean; data: Equipo }>(
    `/api/equipos/${id}`,
    { ...datos, activo: true }
  );
  console.log('📥 Respuesta del backend:', data);
  return data.data;
};