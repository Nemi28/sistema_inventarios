import { body, ValidationChain } from 'express-validator';

// ============================================
// VALIDACIONES PARA EQUIPOS
// ============================================

/**
 * Validación de detalle JSON
 * Verifica que sea un objeto JSON válido
 */
const validarDetalleJSON = body('detalle')
  .optional()
  .custom((value) => {
    if (value === null || value === undefined) return true;
    
    // Si es string, intentar parsearlo
    if (typeof value === 'string') {
      try {
        JSON.parse(value);
        return true;
      } catch {
        throw new Error('El detalle debe ser un JSON válido');
      }
    }
    
    // Si es objeto, validar que sea un objeto válido
    if (typeof value === 'object') {
      return true;
    }
    
    throw new Error('El detalle debe ser un objeto JSON');
  });

/**
 * Validaciones para crear un EQUIPO (registro individual)
 */
export const validarCrearEquipo: ValidationChain[] = [
  body('orden_compra_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El ID de orden de compra debe ser un número entero positivo'),

  body('categoria_id')
    .notEmpty()
    .withMessage('El ID de categoría es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID de categoría debe ser un número entero positivo'),

  body('nombre')
    .notEmpty()
    .withMessage('El nombre del equipo es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),

  body('marca')
    .notEmpty()
    .withMessage('La marca es obligatoria')
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres')
    .trim(),

  body('modelo')
    .notEmpty()
    .withMessage('El modelo es obligatorio')
    .isLength({ min: 1, max: 50 })
    .withMessage('El modelo debe tener entre 1 y 50 caracteres')
    .trim(),

  body('numero_serie')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('El número de serie no puede exceder 100 caracteres')
    .trim(),

  body('inv_entel')
    .optional({ nullable: true })
    .isLength({ max: 50 })
    .withMessage('El código inv_entel no puede exceder 50 caracteres')
    .trim(),

  body('estado')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn(['nuevo', 'operativo', 'inoperativo', 'perdido', 'baja', 'por validar', 'otro'])
    .withMessage('El estado debe ser: nuevo, operativo, inoperativo, perdido, baja, por validar u otro'),

  body('observacion')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('La observación no puede exceder 100 caracteres')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),

  validarDetalleJSON,
];

/**
 * Validaciones para actualizar un EQUIPO
 */
export const validarActualizarEquipo: ValidationChain[] = [
  body('orden_compra_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El ID de orden de compra debe ser un número entero positivo'),

  body('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de categoría debe ser un número entero positivo'),

  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),

  body('marca')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres')
    .trim(),

  body('modelo')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El modelo debe tener entre 1 y 50 caracteres')
    .trim(),

  body('numero_serie')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('El número de serie no puede exceder 100 caracteres')
    .trim(),

  body('inv_entel')
    .optional({ nullable: true })
    .isLength({ max: 50 })
    .withMessage('El código inv_entel no puede exceder 50 caracteres')
    .trim(),

  body('estado')
    .optional()
    .isIn(['nuevo', 'operativo', 'inoperativo', 'perdido', 'baja', 'por validar', 'otro'])
    .withMessage('El estado debe ser: nuevo, operativo, inoperativo, perdido, baja, por validar u otro'),

  body('observacion')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('La observación no puede exceder 100 caracteres')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),

  validarDetalleJSON,
];

/**
 * Validaciones para REGISTRO MÚLTIPLE de equipos
 * Valida un array de equipos (máximo 50)
 */
export const validarCrearEquiposMultiple: ValidationChain[] = [
  body('equipos')
    .notEmpty()
    .withMessage('El array de equipos es obligatorio')
    .isArray({ min: 1, max: 50 })
    .withMessage('Debe enviar entre 1 y 50 equipos'),

  body('equipos.*.orden_compra_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El ID de orden de compra debe ser un número entero positivo'),

  body('equipos.*.categoria_id')
    .notEmpty()
    .withMessage('El ID de categoría es obligatorio en cada equipo')
    .isInt({ min: 1 })
    .withMessage('El ID de categoría debe ser un número entero positivo'),

  body('equipos.*.nombre')
    .notEmpty()
    .withMessage('El nombre del equipo es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),

  body('equipos.*.marca')
    .notEmpty()
    .withMessage('La marca es obligatoria')
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres')
    .trim(),

  body('equipos.*.modelo')
    .notEmpty()
    .withMessage('El modelo es obligatorio')
    .isLength({ min: 1, max: 50 })
    .withMessage('El modelo debe tener entre 1 y 50 caracteres')
    .trim(),

  body('equipos.*.numero_serie')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('El número de serie no puede exceder 100 caracteres')
    .trim(),

  body('equipos.*.inv_entel')
    .optional({ nullable: true })
    .isLength({ max: 50 })
    .withMessage('El código inv_entel no puede exceder 50 caracteres')
    .trim(),

  body('equipos.*.estado')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn(['nuevo', 'operativo', 'inoperativo', 'perdido', 'baja', 'por validar', 'otro'])
    .withMessage('El estado debe ser: nuevo, operativo, inoperativo, perdido, baja, por validar u otro'),

  body('equipos.*.observacion')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('La observación no puede exceder 100 caracteres')
    .trim(),

  body('equipos.*.activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),

  body('equipos.*.detalle')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error('El detalle debe ser un JSON válido');
        }
      }
      
      if (typeof value === 'object') {
        return true;
      }
      
      throw new Error('El detalle debe ser un objeto JSON');
    }),
];