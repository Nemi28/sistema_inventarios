import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as marcasService from '../services/marcas.service';

export const useDeleteMarca = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marcasService.eliminarMarca,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcas'] });
      toast.success('Marca eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al eliminar marca');
    },
  });
};