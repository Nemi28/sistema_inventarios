import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearEquiposMultiple } from '../services/equipos.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';

export const useCreateEquiposMultiple = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearEquiposMultiple,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      toast.success('Equipos creados', {
        description: `${data.cantidad} equipos han sido registrados exitosamente`,
      });
    },
    onError: (error) => {
      toastError(error, 'Error al crear Equipos');
    },
  });
};