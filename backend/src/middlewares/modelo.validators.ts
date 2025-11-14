/**
 * Validaciones para Modelos
 * Sistema de Gestión de Inventarios
 */

import { body, ValidationChain } from 'express-validator';

// ============================================
// VALIDACIONES PARA MODELOS
// ============================================

/**
 * Validaciones para crear MODELO
 */
export const validarCrearModelo: ValidationChain[] = [
  body('subcategoria_id')
    .notEmpty()
    .withMessage('La subcategoría es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La subcategoría debe ser un número válido'),

  body('marca_id')
    .notEmpty()
    .withMessage('La marca es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La marca debe ser un número válido'),

  body('nombre')
    .notEmpty()
    .withMessage('El nombre del modelo es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.\-_&\/]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, puntos, guiones, guion bajo, "&" o "/"')
    .trim(),

  body('especificaciones_tecnicas')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      
      // Si es un string, intentar parsearlo
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('Las especificaciones técnicas deben ser un JSON válido');
        }
      }
      
      // Si es un objeto, está bien
      if (typeof value === 'object') {
        return true;
      }
      
      throw new Error('Las especificaciones técnicas deben ser un objeto JSON');
    }),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

/**
 * Validaciones para actualizar MODELO
 */
export const validarActualizarModelo: ValidationChain[] = [
  body('subcategoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La subcategoría debe ser un número válido'),

  body('marca_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La marca debe ser un número válido'),

  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.\-_&\/]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, puntos, guiones, guion bajo, "&" o "/"')
    .trim(),

  body('especificaciones_tecnicas')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('Las especificaciones técnicas deben ser un JSON válido');
        }
      }
      
      if (typeof value === 'object') {
        return true;
      }
      
      throw new Error('Las especificaciones técnicas deben ser un objeto JSON');
    }),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];