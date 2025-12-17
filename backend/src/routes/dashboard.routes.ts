import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// =============================================
// KPIS DE EQUIPOS
// =============================================

// Equipos por ubicación (Almacén, Tiendas, Personas, En Tránsito)
router.get('/equipos-ubicacion', DashboardController.getEquiposPorUbicacion);

// Equipos por estado (Operativo, Por Validar, En Garantía, Inoperativo, Baja)
router.get('/equipos-estado', DashboardController.getEquiposPorEstado);

// Laptops por tipo de propiedad (Propias vs Alquiladas)
router.get('/laptops-propiedad', DashboardController.getLaptopsPorPropiedad);

// =============================================
// ACTIVIDAD DE MOVIMIENTOS
// =============================================

// Actividad de movimientos (hoy, mes actual, crecimiento)
router.get('/actividad-movimientos', DashboardController.getActividadMovimientos);

// =============================================
// ALERTAS OPERATIVAS
// =============================================

// Alertas operativas (en tránsito largo, pendientes, sin movimiento)
router.get('/alertas-operativas', DashboardController.getAlertasOperativas);

// =============================================
// GRÁFICOS
// =============================================

// Movimientos por mes (últimos 6 meses)
router.get('/movimientos-por-mes', DashboardController.getMovimientosPorMes);

// Distribución de equipos por ubicación (donut)
router.get('/distribucion-ubicacion', DashboardController.getDistribucionUbicacion);

// Movimientos por tipo
router.get('/movimientos-por-tipo', DashboardController.getMovimientosPorTipo);

// Equipos por categoría
router.get('/equipos-por-categoria', DashboardController.getEquiposPorCategoria);

// Top tiendas por cantidad de equipos
router.get('/top-tiendas-equipos', DashboardController.getTopTiendasEquipos);

// =============================================
// TABLAS RECIENTES
// =============================================

// Últimos movimientos
router.get('/ultimos-movimientos', DashboardController.getUltimosMovimientos);

// Equipos en tránsito
router.get('/equipos-en-transito', DashboardController.getEquiposEnTransito);

// =============================================
// RESUMEN DE CATÁLOGO
// =============================================

// Resumen de catálogo (totales de SKUs, tiendas, socios, etc.)
router.get('/resumen-catalogo', DashboardController.getResumenCatalogo);

// Tiendas por socio
router.get('/tiendas-por-socio', DashboardController.getTiendasPorSocio);

// =============================================
// LISTAS PARA FILTROS
// =============================================

// Lista de socios para combo
router.get('/socios-lista', DashboardController.getSociosLista);

// Lista de subcategorías para combo
router.get('/subcategorias-lista', DashboardController.getSubcategoriasLista);

export default router;