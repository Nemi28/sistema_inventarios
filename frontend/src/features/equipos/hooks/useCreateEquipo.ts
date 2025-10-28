import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearEquipo } from '../services/equipos.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';

export const useCreateEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearEquipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      toast.success('Equipo creado', {
        description: 'El equipo ha sido registrado exitosamente',
      });
    },
    onError: (error) => {
      toastError(error, 'Error al crear Equipo');
    },
  });
};