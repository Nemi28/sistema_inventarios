import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as subcategoriasService from '../services/subcategorias.service';

export const useDeleteSubcategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subcategoriasService.eliminarSubcategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias'] });
      toast.success('Subcategoría eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al eliminar subcategoría');
    },
  });
};