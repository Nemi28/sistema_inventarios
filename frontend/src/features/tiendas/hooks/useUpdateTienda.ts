import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarTienda } from '../services/tiendas.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';

export const useUpdateTienda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & any) => 
      actualizarTienda(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiendas'] });
      toast.success('Tienda actualizada', {
        description: 'Los cambios han sido guardados exitosamente',
      });
    },
    onError: (error) => {
      toastError(error, 'Error al actualizar Tienda');
    },
  });
};