import api from '@/services/api';
import { Movimiento, CrearMovimientoRequest, ActualizarEstadoRequest, MovimientoFilters } from '../types';
import { PaginatedResponse } from '@/types/api.types';

/**
 * Crear movimiento (uno o múltiples equipos)
 */
export const crearMovimiento = async (data: CrearMovimientoRequest): Promise<any> => {
  const response = await api.post<{ success: boolean; data: any }>(
    '/api/movimientos',
    data
  );
  return response.data.data;
};

/**
 * Listar movimientos con filtros
 */
export const listarMovimientos = async (
  params: MovimientoFilters = {}
): Promise<PaginatedResponse<Movimiento>> => {
  const { data } = await api.get<PaginatedResponse<Movimiento>>('/api/movimientos', { 
    params 
  });
  return data;
};

/**
 * Obtener historial de un equipo
 */
export const obtenerHistorialEquipo = async (equipoId: number): Promise<Movimiento[]> => {
  const { data } = await api.get<{ success: boolean; data: Movimiento[] }>(
    `/api/movimientos/equipo/${equipoId}`
  );
  return data.data;
};

/**
 * Obtener movimiento por ID
 */
export const obtenerMovimiento = async (id: number): Promise<Movimiento> => {
  const { data } = await api.get<{ success: boolean; data: Movimiento }>(
    `/api/movimientos/${id}`
  );
  return data.data;
};

/**
 * Actualizar estado de movimiento
 */
export const actualizarEstadoMovimiento = async (
  id: number,
  data: ActualizarEstadoRequest
): Promise<Movimiento> => {
  const response = await api.patch<{ success: boolean; data: Movimiento }>(
    `/api/movimientos/${id}/estado`,
    data
  );
  return response.data.data;
};