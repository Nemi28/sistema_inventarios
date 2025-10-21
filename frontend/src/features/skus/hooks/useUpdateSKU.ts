import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarSKU } from '../services/skus.service';
import { toastSuccess, toastError } from '@/lib/toast-utils';

export const useUpdateSKU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) => actualizarSKU(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
      queryClient.invalidateQueries({ queryKey: ['skus', data.id] });
      toastSuccess(
        'SKU actualizado exitosamente',
        `${data.codigo_sku} - ${data.descripcion_sku}`
      );
    },
    onError: (error) => {
      toastError(error, 'Error al actualizar SKU');
    },
  });
};