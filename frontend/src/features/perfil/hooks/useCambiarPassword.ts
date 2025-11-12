import { useMutation } from '@tanstack/react-query';
import { cambiarPassword } from '../services/perfil.service';
import { toast } from 'sonner';

export const useCambiarPassword = () => {
  return useMutation({
    mutationFn: cambiarPassword,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.mensaje || 'Contraseña actualizada correctamente');
      } else {
        toast.error(data.mensaje || 'Error al cambiar contraseña');
      }
    },
    onError: (error: any) => {
      const mensaje =
        error.response?.data?.mensaje ||
        'Error al cambiar la contraseña. Intenta nuevamente.';
      toast.error(mensaje);
    },
  });
};