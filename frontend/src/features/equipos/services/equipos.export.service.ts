/**
 * Servicio de Exportación de Equipos
 * Agregar estas funciones al archivo equipos.service.ts existente
 */

import api from '@/services/api';

interface FiltrosExportarEquipos {
  ubicacion?: 'ALMACEN' | 'TIENDA' | 'PERSONA' | 'EN_TRANSITO';
  estado?: string;
  categoria_id?: number;
  subcategoria_id?: number;
  marca_id?: number;
  modelo_id?: number;
  tienda_id?: number;
  busqueda?: string;
}

/**
 * Exportar equipos a Excel
 */
export async function exportarEquiposExcel(filtros: FiltrosExportarEquipos = {}): Promise<void> {
  const params = new URLSearchParams();

  if (filtros.ubicacion) params.append('ubicacion', filtros.ubicacion);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id.toString());
  if (filtros.subcategoria_id) params.append('subcategoria_id', filtros.subcategoria_id.toString());
  if (filtros.marca_id) params.append('marca_id', filtros.marca_id.toString());
  if (filtros.modelo_id) params.append('modelo_id', filtros.modelo_id.toString());
  if (filtros.tienda_id) params.append('tienda_id', filtros.tienda_id.toString());
  if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

  const response = await api.get(`/api/equipos/exportar?${params.toString()}`, {
    responseType: 'blob',
  });

  // Determinar nombre del archivo según filtro
  let fileName = 'equipos';
  if (filtros.ubicacion === 'ALMACEN') fileName = 'equipos_almacen';
  else if (filtros.ubicacion === 'TIENDA') fileName = 'equipos_tiendas';
  else if (filtros.ubicacion === 'PERSONA') fileName = 'equipos_personas';

  const fecha = new Date().toISOString().split('T')[0];
  const fullFileName = `${fileName}_${fecha}.xlsx`;

  // Crear blob y descargar
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Exportar equipos en almacén
 */
export async function exportarEquiposAlmacen(): Promise<void> {
  return exportarEquiposExcel({ ubicacion: 'ALMACEN' });
}

/**
 * Exportar equipos en tiendas
 */
export async function exportarEquiposTiendas(): Promise<void> {
  return exportarEquiposExcel({ ubicacion: 'TIENDA' });
}

/**
 * Exportar equipos en personas
 */
export async function exportarEquiposPersonas(): Promise<void> {
  return exportarEquiposExcel({ ubicacion: 'PERSONA' });
}