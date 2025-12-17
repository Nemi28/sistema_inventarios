import api from '@/services/api';

import {
  DashboardResponse,
  EquiposPorUbicacion,
  EquiposPorEstado,
  ActividadMovimientos,
  AlertasOperativas,
  MovimientoPorMes,
  DistribucionUbicacion,
  MovimientoPorTipo,
  EquipoPorCategoria,
  TopTiendaEquipos,
  UltimoMovimiento,
  EquipoEnTransito,
  ResumenCatalogo,
  TiendasPorSocio,
  LaptopsPorPropiedad,
  SocioLista,
  SubcategoriaLista,
  DashboardFiltros,
} from '../types';

// Helper para construir query params
const buildQueryParams = (filtros?: DashboardFiltros): string => {
  if (!filtros) return '';
  const params = new URLSearchParams();
  if (filtros.socio_id) params.append('socio_id', filtros.socio_id.toString());
  if (filtros.subcategoria_id) params.append('subcategoria_id', filtros.subcategoria_id.toString());
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// =============================================================
// LISTAS PARA FILTROS
// =============================================================

export const obtenerSociosLista = async (): Promise<SocioLista[]> => {
  const { data } = await api.get<DashboardResponse<SocioLista[]>>(
    '/api/dashboard/socios-lista'
  );
  return data.data;
};

export const obtenerSubcategoriasLista = async (): Promise<SubcategoriaLista[]> => {
  const { data } = await api.get<DashboardResponse<SubcategoriaLista[]>>(
    '/api/dashboard/subcategorias-lista'
  );
  return data.data;
};

// =============================================================
// KPIS DE EQUIPOS
// =============================================================

export const obtenerEquiposPorUbicacion = async (filtros?: DashboardFiltros): Promise<EquiposPorUbicacion> => {
  const { data } = await api.get<DashboardResponse<EquiposPorUbicacion>>(
    `/api/dashboard/equipos-ubicacion${buildQueryParams(filtros)}`
  );
  return data.data;
};

export const obtenerEquiposPorEstado = async (filtros?: DashboardFiltros): Promise<EquiposPorEstado> => {
  const { data } = await api.get<DashboardResponse<EquiposPorEstado>>(
    `/api/dashboard/equipos-estado${buildQueryParams(filtros)}`
  );
  return data.data;
};

export const obtenerLaptopsPorPropiedad = async (filtros?: DashboardFiltros): Promise<LaptopsPorPropiedad> => {
  const { data } = await api.get<DashboardResponse<LaptopsPorPropiedad>>(
    `/api/dashboard/laptops-propiedad${buildQueryParams(filtros)}`
  );
  return data.data;
};

// =============================================================
// ACTIVIDAD DE MOVIMIENTOS
// =============================================================

export const obtenerActividadMovimientos = async (filtros?: DashboardFiltros): Promise<ActividadMovimientos> => {
  const { data } = await api.get<DashboardResponse<ActividadMovimientos>>(
    `/api/dashboard/actividad-movimientos${buildQueryParams(filtros)}`
  );
  return data.data;
};

// =============================================================
// ALERTAS OPERATIVAS
// =============================================================

export const obtenerAlertasOperativas = async (filtros?: DashboardFiltros): Promise<AlertasOperativas> => {
  const { data } = await api.get<DashboardResponse<AlertasOperativas>>(
    `/api/dashboard/alertas-operativas${buildQueryParams(filtros)}`
  );
  return data.data;
};

// =============================================================
// GRÁFICOS
// =============================================================

export const obtenerMovimientosPorMes = async (
  periodo: number,
  filtros?: DashboardFiltros
): Promise<MovimientoPorMes[]> => {
  const params = new URLSearchParams();
  params.append('periodo', periodo.toString());
  if (filtros?.socio_id) params.append('socio_id', filtros.socio_id.toString());
  if (filtros?.subcategoria_id) params.append('subcategoria_id', filtros.subcategoria_id.toString());
  
  const { data } = await api.get<DashboardResponse<MovimientoPorMes[]>>(
    `/api/dashboard/movimientos-por-mes?${params.toString()}`
  );
  return data.data;
};

export const obtenerDistribucionUbicacion = async (filtros?: DashboardFiltros): Promise<DistribucionUbicacion[]> => {
  const { data } = await api.get<DashboardResponse<DistribucionUbicacion[]>>(
    `/api/dashboard/distribucion-ubicacion${buildQueryParams(filtros)}`
  );
  return data.data;
};

export const obtenerMovimientosPorTipo = async (filtros?: DashboardFiltros): Promise<MovimientoPorTipo[]> => {
  const { data } = await api.get<DashboardResponse<MovimientoPorTipo[]>>(
    `/api/dashboard/movimientos-por-tipo${buildQueryParams(filtros)}`
  );
  return data.data;
};

export const obtenerEquiposPorCategoria = async (filtros?: DashboardFiltros): Promise<EquipoPorCategoria[]> => {
  const { data } = await api.get<DashboardResponse<EquipoPorCategoria[]>>(
    `/api/dashboard/equipos-por-categoria${buildQueryParams(filtros)}`
  );
  return data.data;
};

export const obtenerTopTiendasEquipos = async (filtros?: DashboardFiltros): Promise<TopTiendaEquipos[]> => {
  const { data } = await api.get<DashboardResponse<TopTiendaEquipos[]>>(
    `/api/dashboard/top-tiendas-equipos${buildQueryParams(filtros)}`
  );
  return data.data;
};

// =============================================================
// TABLAS RECIENTES
// =============================================================

export const obtenerUltimosMovimientos = async (filtros?: DashboardFiltros): Promise<UltimoMovimiento[]> => {
  const { data } = await api.get<DashboardResponse<UltimoMovimiento[]>>(
    `/api/dashboard/ultimos-movimientos${buildQueryParams(filtros)}`
  );
  return data.data;
};

export const obtenerEquiposEnTransito = async (filtros?: DashboardFiltros): Promise<EquipoEnTransito[]> => {
  const { data } = await api.get<DashboardResponse<EquipoEnTransito[]>>(
    `/api/dashboard/equipos-en-transito${buildQueryParams(filtros)}`
  );
  return data.data;
};

// =============================================================
// RESUMEN DE CATÁLOGO
// =============================================================

export const obtenerResumenCatalogo = async (): Promise<ResumenCatalogo> => {
  const { data } = await api.get<DashboardResponse<ResumenCatalogo>>(
    '/api/dashboard/resumen-catalogo'
  );
  return data.data;
};

export const obtenerTiendasPorSocio = async (): Promise<TiendasPorSocio[]> => {
  const { data } = await api.get<DashboardResponse<TiendasPorSocio[]>>(
    '/api/dashboard/tiendas-por-socio'
  );
  return data.data;
};