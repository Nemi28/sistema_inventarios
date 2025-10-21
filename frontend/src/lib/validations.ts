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