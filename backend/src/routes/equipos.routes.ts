/**
 * Rutas Equipos
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as equipoController from '../controllers/equipos.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { validarCrearEquipo, validarActualizarEquipo } from '../middlewares/equipos.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/equipos - Listar equipos con paginación y filtros
router.get('/', verificarToken, equipoController.listar);

// GET /api/equipos/buscar?q=termino - Buscar equipos
router.get('/buscar', verificarToken, equipoController.buscar);

// GET /api/equipos/almacen - Listar equipos en almacén
router.get('/almacen', verificarToken, equipoController.listarAlmacen);

// GET /api/equipos/tiendas - Listar equipos en tiendas
router.get('/tiendas', verificarToken, equipoController.listarTiendas);

// GET /api/equipos/personas - Listar equipos asignados a personas
router.get('/personas', verificarToken, equipoController.listarPersonas);

// GET /api/equipos/:id - Obtener equipo por ID
router.get('/:id', verificarToken, equipoController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/equipos - Crear nuevo equipo
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearEquipo,
  equipoController.crear
);

// PUT /api/equipos/:id - Actualizar equipo
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarEquipo,
  equipoController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/equipos/:id - Eliminar equipo (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  equipoController.eliminar
);

export default router;