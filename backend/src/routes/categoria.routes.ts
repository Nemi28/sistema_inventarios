/**
 * Rutas categorias
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { validarCrearCategoria, validarActualizarCategoria } from '../middlewares/validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/categorias - Listar categorias con paginación y filtros
router.get('/', verificarToken, categoriaController.listar);

// GET /api/categorias/buscar?q=termino - Buscar categorias
router.get('/buscar', verificarToken, categoriaController.buscar);

// GET /api/categorias/:id - Obtener categoria por ID
router.get('/:id', verificarToken, categoriaController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/categorias - Crear nueva Categoria
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearCategoria,
  categoriaController.crear
);

// PUT /api/categorias/:id - Actualizar Categoria
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarCategoria,
  categoriaController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/categorias/:id - Eliminar categoria (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  categoriaController.eliminar
);

export default router;