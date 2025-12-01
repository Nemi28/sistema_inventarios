/**
 * Rutas Tiendas
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as tiendaController from '../controllers/tienda.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { validarCrearTienda, validarActualizarTienda } from '../middlewares/tienda.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/tiendas - Listar tiendas con paginación y filtros
router.get('/', verificarToken, tiendaController.listar);

// GET /api/tiendas/buscar?q=termino - Buscar tiendas
router.get('/buscar', verificarToken, tiendaController.buscar);

// GET /api/tiendas/:id - Obtener tienda por ID
router.get('/:id', verificarToken, tiendaController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/tiendas - Crear nueva tienda
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearTienda,
  tiendaController.crear
);

// PUT /api/tiendas/:id - Actualizar tienda
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarTienda,
  tiendaController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/tiendas/:id - Eliminar tienda (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  tiendaController.eliminar
);

export default router;