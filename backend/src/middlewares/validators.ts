import { body, ValidationChain } from 'express-validator';

export const registroValidation: ValidationChain[] = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('rol_id')
    .notEmpty().withMessage('El rol es obligatorio')
    .isInt({ min: 1 }).withMessage('El rol debe ser un número válido')
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
];

// ============================================
// VALIDACIONES PARA SKUs
// ============================================

/**
 * Validaciones para crear SKU
 */
export const validarCrearSKU = [
  body('codigo_sku')
    .notEmpty()
    .withMessage('El código SKU es requerido')
    .isLength({ min: 3, max: 20 })
    .withMessage('El código SKU debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('El código SKU solo puede contener letras, números y guiones')
    .trim(),

  body('descripcion_sku')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 100 })
    .withMessage('La descripción debe tener entre 3 y 100 caracteres')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

/**
 * Validaciones para actualizar SKU
 */
export const validarActualizarSKU = [
  body('codigo_sku')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('El código SKU debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('El código SKU solo puede contener letras, números y guiones')
    .trim(),

  body('descripcion_sku')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('La descripción debe tener entre 3 y 100 caracteres')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

// ============================================
// VALIDACIONES PARA SOCIOS
// ============================================

/**
 * Validaciones para crear SOCIO
 */
export const validarCrearSocio: ValidationChain[] = [
  body('razon_social')
    .notEmpty()
    .withMessage('La razón social es obligatoria')
    .isLength({ min: 3, max: 50 })
    .withMessage('La razón social debe tener entre 3 y 50 caracteres')
    .matches(/^[A-Za-z0-9\s\.\-&]+$/)
    .withMessage('La razón social solo puede contener letras, números, espacios, puntos, guiones o "&"')
    .trim(),

  body('ruc')
    .notEmpty()
    .withMessage('El RUC es obligatorio')
    .isLength({ min: 11, max: 11 })
    .withMessage('El RUC debe tener 11 caracteres')
    .matches(/^[0-9]+$/)
    .withMessage('El RUC solo puede contener números')
    .trim(),

  body('direccion')
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ min: 3, max: 100 })
    .withMessage('La dirección debe tener entre 3 y 100 caracteres')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

/**
 * Validaciones para actualizar SOCIO
 */
export const validarActualizarSocio: ValidationChain[] = [
  body('razon_social')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('La razón social debe tener entre 3 y 50 caracteres')
    .matches(/^[A-Za-z0-9\s\.\-&]+$/)
    .withMessage('La razón social solo puede contener letras, números, espacios, puntos, guiones o "&"')
    .trim(),

  body('ruc')
  .notEmpty()
  .withMessage('El RUC es obligatorio')
  .isLength({ min: 11, max: 11 })
  .withMessage('El RUC debe tener exactamente 11 dígitos')
  .matches(/^[0-9]{11}$/)
  .withMessage('El RUC debe contener solo números')
  .matches(/^[1-2][0-9]{10}$/)  
  .withMessage('El RUC debe iniciar con 10, 15, 17 o 20')
  .trim(),

  body('direccion')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('La dirección debe tener entre 3 y 100 caracteres')
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

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

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
];

// ============================================
// VALIDACIONES PARA CATEGORÍAS
// ============================================

/**
 * Validaciones para crear CATEGORÍA
 */
export const validarCrearCategoria: ValidationChain[] = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la categoría es obligatorio')
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
 * Validaciones para actualizar CATEGORÍA
 */
export const validarActualizarCategoria: ValidationChain[] = [
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
