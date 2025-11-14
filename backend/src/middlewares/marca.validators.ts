/**
 * Validaciones para Marcas
 * Sistema de Gestión de Inventarios
 */

import { body, ValidationChain } from 'express-validator';

// ============================================
// VALIDACIONES PARA MARCAS
// ============================================

/**
 * Validaciones para crear MARCA
 */
export const validarCrearMarca: ValidationChain[] = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la marca es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.\-_&]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, puntos, guiones, guion bajo o "&"')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

/**
 * Validaciones para actualizar MARCA
 */
export const validarActualizarMarca: ValidationChain[] = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.\-_&]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, puntos, guiones, guion bajo o "&"')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];