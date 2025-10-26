import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarCategoria } from '../services/categorias.service';
import { toastSuccess, toastError } from '@/lib/toast-utils';

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) => actualizarCategoria(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categorias', data.id] });
      toastSuccess(
        'Categoría actualizada exitosamente',
        data.nombre
      );
    },
    onError: (error) => {
      toastError(error, 'Error al actualizar categoría');
    },
  });
};