/**
 * Rutas Socios
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as socioController from '../controllers/socio.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { validarCrearSocio, validarActualizarSocio } from '../middlewares/validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/socios - Listar socios con paginación y filtros
router.get('/', verificarToken, socioController.listar);

// GET /api/socios/buscar?q=termino - Buscar socios
router.get('/buscar', verificarToken, socioController.buscar);

// GET /api/socios/:id - Obtener socio por ID
router.get('/:id', verificarToken, socioController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/socios - Crear nuevo socio
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearSocio,
  socioController.crear
);

// PUT /api/socios/:id - Actualizar socio
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarSocio,
  socioController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/socios/:id - Eliminar socio (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  socioController.eliminar
);

export default router;
