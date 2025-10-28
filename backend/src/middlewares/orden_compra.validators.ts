import { body, ValidationChain } from 'express-validator';

// ============================================
// VALIDACIONES PARA ÓRDENES DE COMPRA
// ============================================

/**
 * Validaciones para crear una ORDEN DE COMPRA
 */
export const validarCrearOrdenCompra: ValidationChain[] = [
  body('numero_orden')
    .notEmpty()
    .withMessage('El número de orden es obligatorio')
    .isLength({ min: 1, max: 50 })
    .withMessage('El número de orden debe tener entre 1 y 50 caracteres')
    .trim(),

  body('detalle')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('El detalle no puede exceder 100 caracteres')
    .trim(),

  body('fecha_ingreso')
    .notEmpty()
    .withMessage('La fecha de ingreso es obligatoria')
    .isISO8601()
    .withMessage('La fecha de ingreso debe tener formato válido (YYYY-MM-DD)'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

/**
 * Validaciones para actualizar una ORDEN DE COMPRA
 */
export const validarActualizarOrdenCompra: ValidationChain[] = [
  body('numero_orden')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El número de orden debe tener entre 1 y 50 caracteres')
    .trim(),

  body('detalle')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('El detalle no puede exceder 100 caracteres')
    .trim(),

  body('fecha_ingreso')
    .optional()
    .isISO8601()
    .withMessage('La fecha de ingreso debe tener formato válido (YYYY-MM-DD)'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];