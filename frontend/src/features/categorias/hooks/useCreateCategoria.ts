import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearCategoria } from '../services/categorias.service';
import { toastSuccess, toastError } from '@/lib/toast-utils';

export const useCreateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toastSuccess(
        'Categoría creada exitosamente',
        data.nombre
      );
    },
    onError: (error) => {
      toastError(error, 'Error al crear categoría');
    },
  });
};