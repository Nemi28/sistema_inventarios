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

// GET /api/movimientos/exportar - Exportar movimientos a Excel
router.get(
  '/exportar',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  movimientoController.exportarExcel
);

// GET /api/movimientos/equipo/:equipoId - Obtener historial de un equipo
router.get('/equipo/:equipoId', verificarToken, movimientoController.obtenerHistorialEquipo);

// GET /api/movimientos/:id - Obtener movimiento por ID
router.get('/:id', verificarToken, movimientoController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/movimientos/validar-ubicacion - Validar ubicación de equipos antes de mover
router.post(
  '/validar-ubicacion',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  movimientoController.validarUbicacion
);

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

// PUT /api/movimientos/:id - Actualizar movimiento
router.put('/:id', verificarToken, movimientoController.actualizarMovimientoController);

// POST /api/movimientos/:id/cancelar - Cancelar movimiento
router.post('/:id/cancelar', verificarToken, movimientoController.cancelarMovimientoController);


export default router;