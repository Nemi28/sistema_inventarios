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