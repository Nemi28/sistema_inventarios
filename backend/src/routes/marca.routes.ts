/**
 * Rutas Marcas
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as marcaController from '../controllers/marca.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { validarCrearMarca, validarActualizarMarca } from '../middlewares/marca.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/marcas - Listar marcas con paginación y filtros
router.get('/', verificarToken, marcaController.listar);

// GET /api/marcas/activas - Obtener todas las marcas activas (para selects)
router.get('/activas', verificarToken, marcaController.obtenerActivas);

// GET /api/marcas/buscar?q=termino - Buscar marcas
router.get('/buscar', verificarToken, marcaController.buscar);

// GET /api/marcas/:id - Obtener marca por ID
router.get('/:id', verificarToken, marcaController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/marcas - Crear nueva Marca
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearMarca,
  marcaController.crear
);

// PUT /api/marcas/:id - Actualizar Marca
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarMarca,
  marcaController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/marcas/:id - Eliminar marca (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  marcaController.eliminar
);

export default router;