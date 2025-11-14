import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as modelosService from '../services/modelos.service';

export const useDeleteModelo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosService.eliminarModelo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] });
      toast.success('Modelo eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al eliminar modelo');
    },
  });
};