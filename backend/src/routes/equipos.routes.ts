/**
 * Rutas Equipos
 * Sistema de Gestión de Inventarios
 */

import { Router } from 'express';
import * as equiposController from '../controllers/equipos.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { 
  validarCrearEquipo, 
  validarActualizarEquipo,
  validarCrearEquiposMultiple 
} from '../middlewares/equipos.validators';

const router = Router();

/**
 * Rutas públicas (requieren autenticación pero todos los roles)
 */

// GET /api/equipos - Listar equipos con paginación y filtros
router.get('/', verificarToken, equiposController.listarEquipos);

// GET /api/equipos/buscar?q=termino - Buscar equipos
router.get('/buscar', verificarToken, equiposController.buscarEquipos);

// GET /api/equipos/:id - Obtener equipo por ID
router.get('/:id', verificarToken, equiposController.obtenerEquipoPorId);

/**
 * Rutas protegidas (requieren rol gestor o administrador)
 */

// POST /api/equipos - Crear nuevo equipo (individual)
router.post(
  '/',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearEquipo,
  equiposController.crearEquipo
);

// POST /api/equipos/multiple - Crear múltiples equipos (hasta 50)
router.post(
  '/multiple',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarCrearEquiposMultiple,
  equiposController.crearEquiposMultiple
);

// PUT /api/equipos/:id - Actualizar equipo
router.put(
  '/:id',
  verificarToken,
  verificarRol('gestor', 'administrador'),
  validarActualizarEquipo,
  equiposController.actualizarEquipo
);

/**
 * Rutas solo para administrador
 */

// DELETE /api/equipos/:id - Eliminar equipo (soft delete)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  equiposController.eliminarEquipo
);

export default router;