import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { verificarToken  } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas del dashboard
router.get('/stats', DashboardController.getStats);
router.get('/skus-por-mes', DashboardController.getSkusPorMes);
router.get('/tiendas-por-socio', DashboardController.getTiendasPorSocio);
router.get('/ordenes-por-mes', DashboardController.getOrdenesPorMes);
router.get('/ultimos-skus', DashboardController.getUltimosSKUs);
router.get('/ultimas-tiendas', DashboardController.getUltimasTiendas);
router.get('/ultimas-ordenes', DashboardController.getUltimasOrdenes);

export default router;