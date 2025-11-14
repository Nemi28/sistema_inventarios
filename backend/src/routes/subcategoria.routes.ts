/**
 * Rutas Subcategorías
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as subcategoriaController from '../controllers/subcategoria.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { 
  validarCrearSubcategoria, 
  validarActualizarSubcategoria 
} from '../middlewares/subcategoria.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/subcategorias - Listar subcategorías con paginación y filtros
router.get('/', verificarToken, subcategoriaController.listar);

// GET /api/subcategorias/buscar?q=termino - Buscar subcategorías
router.get('/buscar', verificarToken, subcategoriaController.buscar);

// GET /api/subcategorias/categoria/:categoriaId - Obtener subcategorías por categoría (para selects)
router.get('/categoria/:categoriaId', verificarToken, subcategoriaController.obtenerPorCategoria);

// GET /api/subcategorias/:id - Obtener subcategoría por ID
router.get('/:id', verificarToken, subcategoriaController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/subcategorias - Crear nueva Subcategoría
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearSubcategoria,
  subcategoriaController.crear
);

// PUT /api/subcategorias/:id - Actualizar Subcategoría
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarSubcategoria,
  subcategoriaController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/subcategorias/:id - Eliminar subcategoría (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  subcategoriaController.eliminar
);

export default router;