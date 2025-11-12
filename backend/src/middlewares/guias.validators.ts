import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validaciones para el endpoint de generar guía
 * POST /api/guias/generar-excel
 */
export const validateGenerarGuia = [
  // Tipo de guía
  body('tipo')
    .notEmpty()
    .withMessage('El tipo de guía es obligatorio')
    .isIn(['envio', 'recojo'])
    .withMessage('El tipo debe ser "envio" o "recojo"'),

  // Fecha de inicio de traslado
  body('fecha_inicio_traslado')
    .notEmpty()
    .withMessage('La fecha de inicio de traslado es obligatoria')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/)
    .withMessage('La fecha debe tener formato DD/MM/YYYY'),

  // Tienda ID
  body('tienda_id')
    .notEmpty()
    .withMessage('La tienda es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La tienda debe ser un número válido'),

  // Número de orden
  body('nro_orden')
    .notEmpty()
    .withMessage('El número de orden es obligatorio')
    .isString()
    .withMessage('El número de orden debe ser texto')
    .isLength({ min: 1, max: 20 })
    .withMessage('El número de orden debe tener entre 1 y 20 caracteres')
    .matches(/^[A-Za-z0-9\-]+$/)
    .withMessage('El número de orden solo puede contener letras, números y guiones'),

  // Observación (opcional)
  body('observacion')
    .optional()
    .isString()
    .withMessage('La observación debe ser texto')
    .isLength({ max: 200 })
    .withMessage('La observación no puede exceder 200 caracteres'),

  // Detalle (array de SKUs)
  body('detalle')
    .notEmpty()
    .withMessage('Debe incluir al menos un SKU en el detalle')
    .isArray({ min: 1 })
    .withMessage('El detalle debe ser un array con al menos un elemento'),

  // Validar cada item del detalle
  body('detalle.*.cantidad')
    .notEmpty()
    .withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),

  body('detalle.*.sku_id')
    .notEmpty()
    .withMessage('El SKU es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El SKU debe ser un número válido'),

  body('detalle.*.serie')
    .optional()
    .isString()
    .withMessage('La serie debe ser texto'),

  // Middleware para manejar errores de validación
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array().map((err) => ({
          field: err.type === 'field' ? err.path : 'unknown',
          message: err.msg,
        })),
      });
    }
    
    next();
  },
];

/**
 * Validación adicional: verificar que la fecha sea válida
 */
export const validateFechaValida = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fecha_inicio_traslado } = req.body;

  if (!fecha_inicio_traslado) {
    return next();
  }

  try {
    // Parsear fecha DD/MM/YYYY
    const [dia, mes, anio] = fecha_inicio_traslado.split('/').map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    // Verificar que la fecha sea válida
    if (
      fecha.getDate() !== dia ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getFullYear() !== anio
    ) {
      return res.status(400).json({
        success: false,
        message: 'La fecha proporcionada no es válida',
      });
    }

    // Verificar que no sea una fecha muy antigua
    const fechaMinima = new Date();
    fechaMinima.setFullYear(fechaMinima.getFullYear() - 1); // 1 año atrás

    if (fecha < fechaMinima) {
      return res.status(400).json({
        success: false,
        message: 'La fecha no puede ser mayor a 1 año atrás',
      });
    }

    // Verificar que no sea muy en el futuro
    const fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() + 1); // 1 año adelante

    if (fecha > fechaMaxima) {
      return res.status(400).json({
        success: false,
        message: 'La fecha no puede ser mayor a 1 año en el futuro',
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Error al validar la fecha',
    });
  }
};