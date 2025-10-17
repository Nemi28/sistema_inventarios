/**
 * Rutas SKUs
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as skuController from '../controllers/sku.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { validarCrearSKU, validarActualizarSKU } from '../middlewares/validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/skus - Listar SKUs con paginación y filtros
router.get('/', verificarToken, skuController.listar);

// GET /api/skus/buscar?q=termino - Buscar SKUs
router.get('/buscar', verificarToken, skuController.buscar);

// GET /api/skus/:id - Obtener SKU por ID
router.get('/:id', verificarToken, skuController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/skus - Crear nuevo SKU
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearSKU,
  skuController.crear
);

// PUT /api/skus/:id - Actualizar SKU
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarSKU,
  skuController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/skus/:id - Eliminar SKU (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  skuController.eliminar
);

export default router;