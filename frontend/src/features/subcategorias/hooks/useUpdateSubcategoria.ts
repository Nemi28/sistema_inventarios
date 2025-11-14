import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as subcategoriasService from '../services/subcategorias.service';
import { Subcategoria } from '../types';

export const useUpdateSubcategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Subcategoria> }) =>
      subcategoriasService.actualizarSubcategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias'] });
      toast.success('Subcategoría actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar subcategoría');
    },
  });
};