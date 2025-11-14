import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as marcasService from '../services/marcas.service';
import { Marca } from '../types';

export const useUpdateMarca = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Marca> }) =>
      marcasService.actualizarMarca(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcas'] });
      toast.success('Marca actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar marca');
    },
  });
};