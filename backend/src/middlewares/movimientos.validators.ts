/**
 * Validadores para Movimientos
 * Sistema de Gestión de Inventarios
 */

import { body } from 'express-validator';

export const validarCrearMovimiento = [
  body('equipos_ids')
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar al menos un equipo'),

  body('equipos_ids.*')
    .isInt({ min: 1 })
    .withMessage('Cada ID de equipo debe ser un número válido'),

  body('tipo_movimiento')
    .isIn([
      'INGRESO_ALMACEN',
      'SALIDA_ASIGNACION',
      'SALIDA_REEMPLAZO',
      'SALIDA_PRESTAMO',
      'RETORNO_TIENDA',
      'RETORNO_PERSONA',
      'TRANSFERENCIA_TIENDAS',
      'CAMBIO_ESTADO',
    ])
    .withMessage('Tipo de movimiento inválido'),

  body('ubicacion_origen')
    .isIn(['ALMACEN', 'TIENDA', 'PERSONA'])
    .withMessage('Ubicación origen inválida'),

  body('ubicacion_destino')
    .isIn(['ALMACEN', 'TIENDA', 'PERSONA'])
    .withMessage('Ubicación destino inválida'),

  body('estado_movimiento')
    .isIn(['PENDIENTE', 'EN_TRANSITO', 'COMPLETADO', 'CANCELADO'])
    .withMessage('Estado de movimiento inválido'),

  body('fecha_salida')
    .notEmpty()
    .withMessage('La fecha de salida es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido'),

  body('tienda_destino_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de tienda destino inválido'),

  body('tienda_origen_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de tienda origen inválido'),

  body('persona_destino')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre de la persona debe tener entre 3 y 100 caracteres'),

  body('persona_origen')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre de la persona debe tener entre 3 y 100 caracteres'),

  body('codigo_acta')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El código de acta no debe exceder 50 caracteres'),

  body('ticket_helix')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El ticket Helix no debe exceder 50 caracteres'),

  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El motivo no debe exceder 500 caracteres'),

  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no deben exceder 1000 caracteres'),
];

export const validarActualizarEstado = [
  body('estado_movimiento')
    .isIn(['PENDIENTE', 'EN_TRANSITO', 'COMPLETADO', 'CANCELADO'])
    .withMessage('Estado de movimiento inválido'),

  body('fecha_llegada')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido'),

  // ✅ AGREGAR: Permitir actualizar código de acta
  body('codigo_acta')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El código de acta debe tener entre 3 y 50 caracteres'),
];