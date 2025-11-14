import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as modelosService from '../services/modelos.service';

export const useCrearModelo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosService.crearModelo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] });
      toast.success('Modelo creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al crear modelo');
    },
  });
};