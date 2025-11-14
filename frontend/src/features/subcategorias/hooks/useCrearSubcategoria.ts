import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as subcategoriasService from '../services/subcategorias.service';

export const useCrearSubcategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subcategoriasService.crearSubcategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias'] });
      toast.success('Subcategoría creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al crear subcategoría');
    },
  });
};
