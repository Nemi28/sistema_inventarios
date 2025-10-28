import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarEquipo } from '../services/equipos.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';

export const useUpdateEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      actualizarEquipo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      toast.success('Equipo actualizado', {
        description: 'El equipo ha sido actualizado exitosamente',
      });
    },
    onError: (error) => {
      toastError(error, 'Error al actualizar Equipo');
    },
  });
};