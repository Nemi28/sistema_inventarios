import { toast } from 'sonner';
import { AxiosError } from 'axios';

/**
 * Mostrar toast de error basado en el tipo de error
 */
export const toastError = (
  error: unknown, 
  defaultMessage = 'Error inesperado'
) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.mensaje || defaultMessage;
    const errores = error.response?.data?.errores;
    
    toast.error(message, {
      description: errores 
        ? errores.map((e: any) => e.msg).join(', ')
        : error.message,
      duration: 5000,
    });
  } else if (error instanceof Error) {
    toast.error(defaultMessage, {
      description: error.message,
      duration: 5000,
    });
  } else {
    toast.error(defaultMessage);
  }
};

/**
 * Toast de éxito con descripción opcional
 */
export const toastSuccess = (
  message: string, 
  description?: string
) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

/**
 * Toast de información
 */
export const toastInfo = (
  message: string, 
  description?: string
) => {
  toast.info(message, {
    description,
    duration: 3000,
  });
};

/**
 * Toast de advertencia
 */
export const toastWarning = (
  message: string, 
  description?: string
) => {
  toast.warning(message, {
    description,
    duration: 4000,
  });
};