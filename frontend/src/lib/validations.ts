import { z } from 'zod';

// ============================================
// VALIDACIONES SKU
// ============================================
export const skuSchema = z.object({
  codigo_sku: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede tener más de 20 caracteres')
    .regex(
      /^[A-Za-z0-9-]+$/,
      'Solo se permiten letras, números y guiones'
    )
    .trim(),
  descripcion_sku: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(100, 'La descripción no puede tener más de 100 caracteres')
    .trim(),
  activo: z.boolean().default(true),
});

export type SKUFormData = z.infer<typeof skuSchema>;

// ============================================
// VALIDACIONES SOCIO CON RUC REAL SUNAT
// ============================================

/**
 * Validar RUC según algoritmo de SUNAT (Perú)
 * @param ruc - RUC de 11 dígitos
 * @returns true si el RUC es válido
 */
const validarRUCPeru = (ruc: string): boolean => {
  // Verificar que sean 11 dígitos
  if (!/^\d{11}$/.test(ruc)) return false;
  
  // Factores de multiplicación según SUNAT
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
  // Calcular suma ponderada
  const suma = ruc
    .slice(0, 10)
    .split('')
    .reduce((acc, digit, i) => acc + parseInt(digit) * factores[i], 0);
  
  // Calcular dígito verificador
  const resto = suma % 11;
  const digitoVerificador = resto === 0 ? 0 : resto === 1 ? 1 : 11 - resto;
  
  // Verificar que coincida con el último dígito
  return digitoVerificador === parseInt(ruc[10]);
};

export const socioSchema = z.object({
  razon_social: z
    .string()
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(50, 'La razón social no puede tener más de 50 caracteres')
    .regex(
      /^[A-Za-z0-9\s\.\-&]+$/,
      'Solo se permiten letras, números, espacios, puntos, guiones y "&"'
    )
    .trim(),
  ruc: z
    .string()
    .length(11, 'El RUC debe tener exactamente 11 dígitos')
    .regex(/^[1-2]\d{10}$/, 'El RUC debe iniciar con 1 o 2')
    .refine(validarRUCPeru, {
      message: 'RUC inválido según dígito verificador SUNAT',
    }),
  direccion: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(100, 'La dirección no puede tener más de 100 caracteres')
    .trim(),
  activo: z.boolean().default(true),
});

export type SocioFormData = z.infer<typeof socioSchema>;

// ============================================
// VALIDACIONES PARA TIENDAS
// ============================================

export const tiendaSchema = z.object({
  pdv: z
    .string()
    .min(1, 'El PDV es obligatorio')
    .length(4, 'El PDV debe tener exactamente 4 dígitos')
    .regex(/^[0-9]{4}$/, 'El PDV debe contener solo números'),
  
  tipo_local: z
    .enum(['TIENDA'], {
      required_error: 'El tipo de local es obligatorio',
    }),
  
  perfil_local: z
    .enum(['TPF', 'TPF - TC'], {
      required_error: 'El perfil de local es obligatorio',
    }),
  
  nombre_tienda: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(
      /^[A-Za-z0-9\s\.\-&]+$/,
      'Solo se permiten letras, números, espacios, puntos, guiones y "&"'
    ),
  
  socio_id: z
    .number({
      required_error: 'Debe seleccionar un socio',
      invalid_type_error: 'Debe seleccionar un socio válido',
    })
    .int()
    .positive('Debe seleccionar un socio válido'),
  
  direccion: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(100, 'La dirección no puede exceder 100 caracteres'),
  
  ubigeo: z
    .string()
    .min(1, 'El UBIGEO es obligatorio')
    .length(6, 'El UBIGEO debe tener exactamente 6 dígitos')
    .regex(/^[0-9]{6}$/, 'El UBIGEO debe contener solo números'),
  
  activo: z.boolean(),
});

export type TiendaFormData = z.infer<typeof tiendaSchema>;

// ============================================
// VALIDACIONES PARA GUÍAS DE REMISIÓN
// ============================================

export const guiaSchema = z.object({
  tipo: z.enum(['envio', 'recojo'], {
    required_error: 'Debe seleccionar un tipo de guía',
  }),
  
  fecha_inicio_traslado: z
    .string()
    .min(1, 'La fecha es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  
  tienda_id: z
    .number({
      required_error: 'Debe seleccionar una tienda',
      invalid_type_error: 'Debe seleccionar una tienda válida',
    })
    .int()
    .positive('Debe seleccionar una tienda válida'),
  
  nro_orden: z
    .string()
    .min(1, 'El número de orden es obligatorio')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9\-]+$/, 'Solo se permiten letras, números y guiones'),
  
  observacion: z
    .string()
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  detalle: z
    .array(
      z.object({
        cantidad: z
          .number({
            required_error: 'La cantidad es obligatoria',
            invalid_type_error: 'La cantidad debe ser un número',
          })
          .int('La cantidad debe ser un número entero')
          .positive('La cantidad debe ser mayor a 0'),
        
        sku_id: z
          .number({
            required_error: 'Debe seleccionar un SKU',
            invalid_type_error: 'Debe seleccionar un SKU válido',
          })
          .int()
          .positive('Debe seleccionar un SKU válido'),
        
        serie: z
          .string()
          .max(50, 'Máximo 50 caracteres')
          .optional()
          .or(z.literal('')),
      })
    )
    .min(1, 'Debe agregar al menos un SKU'),
});

export type GuiaFormData = z.infer<typeof guiaSchema>;

// ============================================
// VALIDACIONES CATEGORÍA
// ============================================
export const categoriaSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .regex(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.\-_&]+$/,
      'Solo se permiten letras, números, espacios, puntos, guiones, guion bajo y "&"'
    )
    .trim(),
  activo: z.boolean().default(true),
});

export type CategoriaFormData = z.infer<typeof categoriaSchema>;