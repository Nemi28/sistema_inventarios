import * as z from 'zod';

/**
 * Schema de validación para Equipo
 */
export const equipoSchema = z.object({
  numero_serie: z.string().optional().or(z.literal('')),
  inv_entel: z.string().optional().or(z.literal('')),
  modelo_id: z.number().min(1, 'Debes seleccionar un modelo'),
  orden_compra_id: z.number().optional(),
  tipo_propiedad: z.enum(['PROPIO', 'ALQUILADO']),
  fecha_compra: z.string().optional().or(z.literal('')),
  garantia: z.any().optional(), // ✅ any para evitar problemas
  sistema_operativo: z.string().optional().or(z.literal('')),
  estado_actual: z.enum(['OPERATIVO', 'POR_VALIDAR', 'EN_GARANTIA', 'BAJA', 'INOPERATIVO']),
  ubicacion_actual: z.enum(['ALMACEN', 'TIENDA', 'PERSONA', 'EN_TRANSITO']),
  tienda_id: z.number().optional(),
  hostname: z.string().optional().or(z.literal('')),
  posicion_tienda: z.string().optional().or(z.literal('')),
  area_tienda: z.string().optional().or(z.literal('')),
  es_accesorio: z.any().optional(), // ✅ any para evitar problemas
  equipo_principal_id: z.number().optional(),
  observaciones: z.string().optional().or(z.literal('')),
  activo: z.any(), // ✅ any para evitar problemas
});

export type EquipoFormValues = z.infer<typeof equipoSchema>;