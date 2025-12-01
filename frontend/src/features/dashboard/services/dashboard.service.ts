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
  TiendasPorSocio
} from '../types';

// =============================================================
// KPIS DE EQUIPOS
// =============================================================

export const obtenerEquiposPorUbicacion = async (): Promise<EquiposPorUbicacion> => {
  const { data } = await api.get<DashboardResponse<EquiposPorUbicacion>>(
    '/api/dashboard/equipos-ubicacion'
  );
  return data.data;
};

export const obtenerEquiposPorEstado = async (): Promise<EquiposPorEstado> => {
  const { data } = await api.get<DashboardResponse<EquiposPorEstado>>(
    '/api/dashboard/equipos-estado'
  );
  return data.data;
};

// =============================================================
// ACTIVIDAD DE MOVIMIENTOS
// =============================================================

export const obtenerActividadMovimientos = async (): Promise<ActividadMovimientos> => {
  const { data } = await api.get<DashboardResponse<ActividadMovimientos>>(
    '/api/dashboard/actividad-movimientos'
  );
  return data.data;
};

// =============================================================
// ALERTAS OPERATIVAS
// =============================================================

export const obtenerAlertasOperativas = async (): Promise<AlertasOperativas> => {
  const { data } = await api.get<DashboardResponse<AlertasOperativas>>(
    '/api/dashboard/alertas-operativas'
  );
  return data.data;
};

// =============================================================
// GRÁFICOS
// =============================================================

export const obtenerMovimientosPorMes = async (
  periodo: number
): Promise<MovimientoPorMes[]> => {
  const { data } = await api.get<DashboardResponse<MovimientoPorMes[]>>(
    `/api/dashboard/movimientos-por-mes?periodo=${periodo}`
  );

  return data.data;
};


export const obtenerDistribucionUbicacion = async (): Promise<DistribucionUbicacion[]> => {
  const { data } = await api.get<DashboardResponse<DistribucionUbicacion[]>>(
    '/api/dashboard/distribucion-ubicacion'
  );
  return data.data;
};

export const obtenerMovimientosPorTipo = async (): Promise<MovimientoPorTipo[]> => {
  const { data } = await api.get<DashboardResponse<MovimientoPorTipo[]>>(
    '/api/dashboard/movimientos-por-tipo'
  );
  return data.data;
};

export const obtenerEquiposPorCategoria = async (): Promise<EquipoPorCategoria[]> => {
  const { data } = await api.get<DashboardResponse<EquipoPorCategoria[]>>(
    '/api/dashboard/equipos-por-categoria'
  );
  return data.data;
};

export const obtenerTopTiendasEquipos = async (): Promise<TopTiendaEquipos[]> => {
  const { data } = await api.get<DashboardResponse<TopTiendaEquipos[]>>(
    '/api/dashboard/top-tiendas-equipos'
  );
  return data.data;
};

// =============================================================
// TABLAS RECIENTES
// =============================================================

export const obtenerUltimosMovimientos = async (): Promise<UltimoMovimiento[]> => {
  const { data } = await api.get<DashboardResponse<UltimoMovimiento[]>>(
    '/api/dashboard/ultimos-movimientos'
  );
  return data.data;
};

export const obtenerEquiposEnTransito = async (): Promise<EquipoEnTransito[]> => {
  const { data } = await api.get<DashboardResponse<EquipoEnTransito[]>>(
    '/api/dashboard/equipos-en-transito'
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
