/**
 * Validaciones para Subcategorías
 * Sistema de Gestión de Inventarios
 */

import { body, ValidationChain } from 'express-validator';

// ============================================
// VALIDACIONES PARA SUBCATEGORÍAS
// ============================================

/**
 * Validaciones para crear SUBCATEGORÍA
 */
export const validarCrearSubcategoria: ValidationChain[] = [
  body('categoria_id')
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La categoría debe ser un número válido'),

  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la subcategoría es obligatorio')
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
 * Validaciones para actualizar SUBCATEGORÍA
 */
export const validarActualizarSubcategoria: ValidationChain[] = [
  body('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La categoría debe ser un número válido'),

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