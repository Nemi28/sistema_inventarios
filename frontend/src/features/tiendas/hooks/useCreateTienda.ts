import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearTienda } from '../services/tiendas.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';

export const useCreateTienda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearTienda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiendas'] });
      toast.success('Tienda creada', {
        description: 'La tienda ha sido registrada exitosamente',
      });
    },
    onError: (error) => {
      toastError(error, 'Error al crear Tienda');
    },
  });
};