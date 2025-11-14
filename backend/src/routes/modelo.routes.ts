/**
 * Rutas Modelos
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as modeloController from '../controllers/modelo.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { 
  validarCrearModelo, 
  validarActualizarModelo 
} from '../middlewares/modelo.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/modelos - Listar modelos con paginación y filtros
router.get('/', verificarToken, modeloController.listar);

// GET /api/modelos/buscar?q=termino - Buscar modelos
router.get('/buscar', verificarToken, modeloController.buscar);

// GET /api/modelos/subcategoria/:subcategoriaId - Obtener modelos por subcategoría (para selects)
router.get('/subcategoria/:subcategoriaId', verificarToken, modeloController.obtenerPorSubcategoria);

// GET /api/modelos/por-marca-subcategoria/:marcaId/:subcategoriaId - Para combos escalonados
router.get(
  '/por-marca-subcategoria/:marcaId/:subcategoriaId',
  verificarToken,
  modeloController.obtenerModelosPorMarcaYSubcategoria
);

// GET /api/modelos/:id - Obtener modelo por ID
router.get('/:id', verificarToken, modeloController.obtenerPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/modelos - Crear nuevo Modelo
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearModelo,
  modeloController.crear
);

// PUT /api/modelos/:id - Actualizar Modelo
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarModelo,
  modeloController.actualizar
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/modelos/:id - Eliminar modelo (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  modeloController.eliminar
);

export default router;