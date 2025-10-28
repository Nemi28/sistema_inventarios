/**
 * Rutas Órdenes de Compra
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as ordenCompraController from '../controllers/orden_compra.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { 
  validarCrearOrdenCompra, 
  validarActualizarOrdenCompra 
} from '../middlewares/orden_compra.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/ordenes-compra - Listar Órdenes de Compra con paginación y filtros
router.get('/', verificarToken, ordenCompraController.listar);

// GET /api/ordenes-compra/buscar?q=termino - Buscar Órdenes de Compra
router.get('/buscar', verificarToken, ordenCompraController.buscar);

// GET /api/ordenes-compra/:id - Obtener Orden de Compra por ID
router.get('/:id', verificarToken, ordenCompraController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/ordenes-compra - Crear nueva Orden de Compra
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearOrdenCompra,
  ordenCompraController.crear
);

// PUT /api/ordenes-compra/:id - Actualizar Orden de Compra
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarOrdenCompra,
  ordenCompraController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/ordenes-compra/:id - Eliminar Orden de Compra (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  ordenCompraController.eliminar
);

export default router;