/**
 * Validadores para Equipos
 * Sistema de Gestión de Inventarios
 */

import { body, ValidationChain } from 'express-validator';

// ============================================
// VALIDACIONES PARA EQUIPOS
// ============================================

/**
 * Validaciones para crear EQUIPO
 */
export const validarCrearEquipo: ValidationChain[] = [
  body('numero_serie')
    .optional()
    .isLength({ max: 30 })
    .withMessage('El número de serie no puede exceder 30 caracteres')
    .trim(),

  body('inv_entel')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El código de inventario Entel no puede exceder 50 caracteres')
    .trim(),

  body('modelo_id')
    .notEmpty()
    .withMessage('El ID del modelo es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del modelo debe ser un número entero positivo'),

  body('orden_compra_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de orden de compra debe ser un número entero positivo'),

  body('tipo_propiedad')
    .notEmpty()
    .withMessage('El tipo de propiedad es obligatorio')
    .isIn(['PROPIO', 'ALQUILADO'])
    .withMessage('El tipo de propiedad debe ser "PROPIO" o "ALQUILADO"'),

  body('fecha_compra')
    .optional({ values: 'null' })
    .custom((value) => {
      if (!value || value === null || value === undefined) {
        return true;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('La fecha de compra debe ser una fecha válida');
      }
      return true;
    }),

  body('garantia')
    .optional()
    .isBoolean()
    .withMessage('El campo garantía debe ser true o false'),

  body('sistema_operativo')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El sistema operativo no puede exceder 50 caracteres')
    .trim(),

  body('estado_actual')
    .notEmpty()
    .withMessage('El estado actual es obligatorio')
    .isIn(['OPERATIVO', 'POR_VALIDAR', 'EN_GARANTIA', 'BAJA', 'INOPERATIVO'])
    .withMessage('El estado debe ser: OPERATIVO, POR_VALIDAR, EN_GARANTIA, BAJA o INOPERATIVO'),

  body('ubicacion_actual')
    .notEmpty()
    .withMessage('La ubicación actual es obligatoria')
    .isIn(['ALMACEN', 'TIENDA', 'PERSONA', 'EN_TRANSITO'])
    .withMessage('La ubicación debe ser: ALMACEN, TIENDA, PERSONA o EN_TRANSITO'),

  body('tienda_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de tienda debe ser un número entero positivo'),

  body('hostname')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El hostname no puede exceder 100 caracteres')
    .trim(),

  body('posicion_tienda')
    .optional()
    .isLength({ max: 20 })
    .withMessage('La posición en tienda no puede exceder 20 caracteres')
    .trim(),

  body('area_tienda')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El área de tienda no puede exceder 50 caracteres')
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

  body('es_accesorio')
    .optional()
    .isBoolean()
    .withMessage('El campo es_accesorio debe ser true o false'),

  body('equipo_principal_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del equipo principal debe ser un número entero positivo'),

  body('observaciones')
    .optional()
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

/**
 * Validaciones para actualizar EQUIPO
 */
export const validarActualizarEquipo: ValidationChain[] = [
  body('numero_serie')
    .optional()
    .isLength({ max: 30 })
    .withMessage('El número de serie no puede exceder 30 caracteres')
    .trim(),

  body('inv_entel')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El código de inventario Entel no puede exceder 50 caracteres')
    .trim(),

  body('modelo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del modelo debe ser un número entero positivo'),

  body('orden_compra_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de orden de compra debe ser un número entero positivo'),

  body('tipo_propiedad')
    .optional()
    .isIn(['PROPIO', 'ALQUILADO'])
    .withMessage('El tipo de propiedad debe ser "PROPIO" o "ALQUILADO"'),

  body('fecha_compra')
    .optional({ values: 'null' })
    .custom((value) => {
      if (!value || value === null || value === undefined) {
        return true;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('La fecha de compra debe ser una fecha válida');
      }
      return true;
    }),

  body('garantia')
    .optional()
    .isBoolean()
    .withMessage('El campo garantía debe ser true o false'),

  body('sistema_operativo')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El sistema operativo no puede exceder 50 caracteres')
    .trim(),

  body('estado_actual')
    .optional()
    .isIn(['OPERATIVO', 'POR_VALIDAR', 'EN_GARANTIA', 'BAJA', 'INOPERATIVO'])
    .withMessage('El estado debe ser: OPERATIVO, POR_VALIDAR, EN_GARANTIA, BAJA o INOPERATIVO'),

  body('ubicacion_actual')
    .optional()
    .isIn(['ALMACEN', 'TIENDA', 'PERSONA', 'EN_TRANSITO'])
    .withMessage('La ubicación debe ser: ALMACEN, TIENDA, PERSONA o EN_TRANSITO'),

  body('tienda_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de tienda debe ser un número entero positivo'),

  body('hostname')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El hostname no puede exceder 100 caracteres')
    .trim(),

  body('posicion_tienda')
    .optional()
    .isLength({ max: 20 })
    .withMessage('La posición en tienda no puede exceder 20 caracteres')
    .trim(),

  body('area_tienda')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El área de tienda no puede exceder 50 caracteres')
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

  body('es_accesorio')
    .optional()
    .isBoolean()
    .withMessage('El campo es_accesorio debe ser true o false'),

  body('equipo_principal_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del equipo principal debe ser un número entero positivo'),

  body('observaciones')
    .optional()
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];