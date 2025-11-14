import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as modelosService from '../services/modelos.service';
import { Modelo } from '../types';

export const useUpdateModelo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Modelo> }) =>
      modelosService.actualizarModelo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] });
      toast.success('Modelo actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar modelo');
    },
  });
};