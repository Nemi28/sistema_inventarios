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

/**
 * Exportar movimientos a Excel
 * Descarga el archivo directamente
 */
export const exportarMovimientosExcel = async (filtros: MovimientoFilters = {}): Promise<void> => {
  // Construir query params
  const params = new URLSearchParams();
  
  if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
  if (filtros.tipo_movimiento) params.append('tipo_movimiento', filtros.tipo_movimiento);
  if (filtros.estado_movimiento) params.append('estado_movimiento', filtros.estado_movimiento);
  if (filtros.ubicacion_origen) params.append('ubicacion_origen', filtros.ubicacion_origen);
  if (filtros.ubicacion_destino) params.append('ubicacion_destino', filtros.ubicacion_destino);
  if (filtros.tienda_origen_id) params.append('tienda_origen_id', filtros.tienda_origen_id.toString());
  if (filtros.tienda_destino_id) params.append('tienda_destino_id', filtros.tienda_destino_id.toString());
  if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
  if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
  if (filtros.codigo_acta) params.append('codigo_acta', filtros.codigo_acta);

  const response = await api.get(`/api/movimientos/exportar?${params.toString()}`, {
    responseType: 'blob',
  });

  // Crear URL del blob y descargar
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Nombre del archivo
  const fileName = `movimientos_${new Date().toISOString().slice(0, 10)}.xlsx`;
  
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};