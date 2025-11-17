import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// =============================================
// RUTAS EXISTENTES - Estadísticas y Gráficos
// =============================================

// Estadísticas generales
router.get('/stats', DashboardController.getStats);

// Gráficos temporales (con soporte de parámetro ?periodo=3|6|12)
router.get('/skus-por-mes', DashboardController.getSkusPorMes);
router.get('/ordenes-por-mes', DashboardController.getOrdenesPorMes);

// Gráfico de tiendas por socio
router.get('/tiendas-por-socio', DashboardController.getTiendasPorSocio);

// Actividad reciente
router.get('/ultimos-skus', DashboardController.getUltimosSKUs);
router.get('/ultimas-tiendas', DashboardController.getUltimasTiendas);
router.get('/ultimas-ordenes', DashboardController.getUltimasOrdenes);

// =============================================
// RUTAS NUEVAS - Métricas Adicionales
// =============================================

// Métricas de inventario (modelos, marcas, promedios)
router.get('/metricas-inventario', DashboardController.getInventoryMetrics);

// Métricas de cobertura del catálogo
router.get('/metricas-cobertura', DashboardController.getCoverageMetrics);

// Tasa de crecimiento mensual
router.get('/tasa-crecimiento', DashboardController.getGrowthRate);

// =============================================
// RUTAS NUEVAS - Gráficos Adicionales
// =============================================

// Modelos registrados por mes (con soporte de parámetro ?periodo=3|6|12)
router.get('/modelos-por-mes', DashboardController.getModelosPorMes);

// Top categorías por cantidad de modelos (con parámetro ?limit=5|10|15)
router.get('/top-categorias', DashboardController.getTopCategorias);

// Distribución de equipos por categoría (para pie/donut chart)
router.get('/distribucion-equipos', DashboardController.getDistribucionEquipos);

// Top marcas del catálogo (con parámetros ?limit=10&categoria_id=1)
router.get('/top-marcas', DashboardController.getTopMarcas);

// Matriz de cobertura marca-categoría (heatmap)
router.get('/matriz-cobertura', DashboardController.getMatrizCobertura);

// =============================================
// RUTAS NUEVAS - Actividad Reciente
// =============================================

// Últimos modelos registrados (con parámetro ?limit=5)
router.get('/ultimos-modelos', DashboardController.getUltimosModelos);

// =============================================
// RUTAS NUEVAS - Alertas e Indicadores
// =============================================

// Alertas e indicadores del dashboard
router.get('/alertas-indicadores', DashboardController.getAlertasIndicadores);

export default router;