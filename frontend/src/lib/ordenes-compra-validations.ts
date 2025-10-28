import * as z from 'zod';

/**
 * Schema de validación para Orden de Compra
 */
export const ordenCompraSchema = z.object({
  numero_orden: z
    .string()
    .min(1, 'El número de orden es obligatorio')
    .max(50, 'El número de orden no puede exceder 50 caracteres'),
  detalle: z
    .string()
    .max(100, 'El detalle no puede exceder 100 caracteres')
    .nullable()
    .optional()
    .transform(val => val === '' ? null : val),
  fecha_ingreso: z
    .string()
    .min(1, 'La fecha de ingreso es obligatoria'),
  activo: z.boolean(),
});

/**
 * Tipo inferido del schema
 */
export type OrdenCompraFormValues = z.infer<typeof ordenCompraSchema>;