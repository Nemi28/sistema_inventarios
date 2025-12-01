/**
 * Validaciones para Tiendas
 * Agregar/reemplazar en el archivo validators.ts existente
 */

import { body, ValidationChain } from 'express-validator';

// ============================================
// VALIDACIONES PARA TIENDAS
// ============================================

/**
 * Validaciones para crear TIENDA
 */
export const validarCrearTienda: ValidationChain[] = [
  body('pdv')
    .notEmpty()
    .withMessage('El PDV es obligatorio')
    .isLength({ min: 4, max: 4 })
    .withMessage('El PDV debe tener exactamente 4 dígitos')
    .matches(/^[0-9]{4}$/)
    .withMessage('El PDV debe contener solo números')
    .trim(),

  body('tipo_local')
    .notEmpty()
    .withMessage('El tipo de local es obligatorio')
    .isIn(['TIENDA'])
    .withMessage('El tipo de local debe ser "TIENDA"'),

  body('perfil_local')
    .notEmpty()
    .withMessage('El perfil de local es obligatorio')
    .isIn(['TPF', 'TPF - TC'])
    .withMessage('El perfil de local debe ser "TPF" o "TPF - TC"'),

  body('nombre_tienda')
    .notEmpty()
    .withMessage('El nombre de la tienda es obligatorio')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de la tienda debe tener entre 3 y 50 caracteres')
    .matches(/^[A-Za-z0-9\s\.\-&]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, puntos, guiones o "&"')
    .trim(),

  body('socio_id')
    .notEmpty()
    .withMessage('El ID del socio es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del socio debe ser un número entero positivo'),

  body('direccion')
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ min: 5, max: 100 })
    .withMessage('La dirección debe tener entre 5 y 100 caracteres')
    .trim(),

  body('ubigeo')
    .notEmpty()
    .withMessage('El UBIGEO es obligatorio')
    .isLength({ min: 6, max: 6 })
    .withMessage('El UBIGEO debe tener exactamente 6 dígitos')
    .matches(/^[0-9]{6}$/)
    .withMessage('El UBIGEO debe contener solo números')
    .trim(),

  body('responsable_socio')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El responsable del socio no puede exceder 100 caracteres')
    .trim(),

  body('responsable_entel')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El responsable Entel no puede exceder 100 caracteres')
    .trim(),

  body('enlace')
    .optional()
    .isIn(['SI', 'NO'])
    .withMessage('El enlace debe ser "SI" o "NO"'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

/**
 * Validaciones para actualizar TIENDA
 */
export const validarActualizarTienda: ValidationChain[] = [
  body('pdv')
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('El PDV debe tener exactamente 4 dígitos')
    .matches(/^[0-9]{4}$/)
    .withMessage('El PDV debe contener solo números')
    .trim(),

  body('tipo_local')
    .optional()
    .isIn(['TIENDA'])
    .withMessage('El tipo de local debe ser "TIENDA"'),

  body('perfil_local')
    .optional()
    .isIn(['TPF', 'TPF - TC'])
    .withMessage('El perfil de local debe ser "TPF" o "TPF - TC"'),

  body('nombre_tienda')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de la tienda debe tener entre 3 y 50 caracteres')
    .matches(/^[A-Za-z0-9\s\.\-&]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, puntos, guiones o "&"')
    .trim(),

  body('socio_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del socio debe ser un número entero positivo'),

  body('direccion')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('La dirección debe tener entre 5 y 100 caracteres')
    .trim(),

  body('ubigeo')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('El UBIGEO debe tener exactamente 6 dígitos')
    .matches(/^[0-9]{6}$/)
    .withMessage('El UBIGEO debe contener solo números')
    .trim(),

  body('responsable_socio')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El responsable del socio no puede exceder 100 caracteres')
    .trim(),

  body('responsable_entel')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El responsable Entel no puede exceder 100 caracteres')
    .trim(),

  body('enlace')
    .optional()
    .isIn(['SI', 'NO'])
    .withMessage('El enlace debe ser "SI" o "NO"'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];