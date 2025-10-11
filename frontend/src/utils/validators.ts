// Validar formato de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar complejidad de contraseña
export const isValidPassword = (password: string): boolean => {
  // Mínimo 6 caracteres, al menos una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Validar longitud de nombre
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 3 && name.trim().length <= 100;
};

// Calcular fortaleza de contraseña
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  
  let strength = 0;
  
  // Tiene mayúsculas
  if (/[A-Z]/.test(password)) strength++;
  // Tiene minúsculas
  if (/[a-z]/.test(password)) strength++;
  // Tiene números
  if (/\d/.test(password)) strength++;
  // Tiene símbolos
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  // Longitud mayor a 8
  if (password.length >= 8) strength++;
  // Longitud mayor a 12
  if (password.length >= 12) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

// Mensajes de validación
export const validationMessages = {
  email: {
    required: 'El email es requerido',
    invalid: 'El formato del email no es válido',
  },
  password: {
    required: 'La contraseña es requerida',
    invalid: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número',
    mismatch: 'Las contraseñas no coinciden',
  },
  name: {
    required: 'El nombre es requerido',
    invalid: 'El nombre debe tener entre 3 y 100 caracteres',
  },
  role: {
    required: 'Debes seleccionar un rol',
  },
};