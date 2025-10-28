import * as z from 'zod';

/**
 * Schema de validación para Equipo Individual
 */
export const equipoSchema = z.object({
  orden_compra_id: z.number().optional().nullable(),
  categoria_id: z.number({
    required_error: 'La categoría es obligatoria',
  }),
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  marca: z
    .string()
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(50, 'La marca no puede exceder 50 caracteres'),
  modelo: z
    .string()
    .min(1, 'El modelo es obligatorio')
    .max(50, 'El modelo no puede exceder 50 caracteres'),
  numero_serie: z.string().max(100).optional().nullable(),
  inv_entel: z.string().max(50).optional().nullable(),
  estado: z.enum([
    'nuevo',
    'operativo',
    'inoperativo',
    'perdido',
    'baja',
    'por validar',
    'otro',
  ]),
  observacion: z.string().max(100).optional().nullable(),
  activo: z.boolean(),
  detalle: z.any().nullable().optional(),
});

/**
 * Schema de validación para Equipos Múltiples
 */
export const equiposMultipleSchema = z.object({
  equipos: z
    .array(equipoSchema)
    .min(1, 'Debe agregar al menos un equipo')
    .max(50, 'No puede agregar más de 50 equipos'),
});

/**
 * Tipos inferidos de los schemas
 */
export type EquipoFormValues = z.infer<typeof equipoSchema>;
export type EquiposMultipleFormValues = z.infer<typeof equiposMultipleSchema>;