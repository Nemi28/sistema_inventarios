import { Router } from 'express';
import { ActasController } from '../controllers/actas.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

/**
 * POST /api/actas/generar-pdf
 * Genera el PDF del acta de asignación
 */
router.post('/generar-pdf', ActasController.generarPDF);

export default router;