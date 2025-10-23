/**
 * Rutas Guías de Remisión
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import { GuiasController } from '../controllers/guias.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { validateGenerarGuia, validateFechaValida } from '../middlewares/guias.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/guias/tiendas - Obtiene lista de tiendas activas para el dropdown
router.get('/tiendas', verificarToken, GuiasController.obtenerTiendasActivas);

// GET /api/guias/skus - Obtiene lista de SKUs activos para el dropdown
router.get('/skus', verificarToken, GuiasController.obtenerSKUsActivos);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/guias/generar-excel - Genera archivo Excel de guía de remisión
router.post(
  '/generar-excel',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validateGenerarGuia,
  validateFechaValida,
  GuiasController.generarExcel
);

export default router;