import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearSKU } from '../services/skus.service';
import { toastSuccess, toastError } from '@/lib/toast-utils';

export const useCreateSKU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearSKU,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
      toastSuccess(
        'SKU creado exitosamente',
        `${data.codigo_sku} - ${data.descripcion_sku}`
      );
    },
    onError: (error) => {
      toastError(error, 'Error al crear SKU');
    },
  });
};