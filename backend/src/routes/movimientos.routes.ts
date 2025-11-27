import { Router } from 'express';
import * as movimientoController from '../controllers/movimientos.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import {
  validarCrearMovimiento,
  validarActualizarEstado,
} from '../middlewares/movimientos.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/movimientos - Listar movimientos con paginación y filtros
router.get('/', verificarToken, movimientoController.listar);

// GET /api/movimientos/equipo/:equipoId - Obtener historial de un equipo
router.get('/equipo/:equipoId', verificarToken, movimientoController.obtenerHistorialEquipo);

// GET /api/movimientos/:id - Obtener movimiento por ID
router.get('/:id', verificarToken, movimientoController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/movimientos - Crear movimiento (uno o múltiples equipos)
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearMovimiento,
  movimientoController.crear
);

// PATCH /api/movimientos/:id/estado - Actualizar estado de movimiento
router.patch(
  '/:id/estado',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarEstado,
  movimientoController.actualizarEstado
);

export default router;