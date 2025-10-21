import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarSocio } from '../services/socios.service';
import { toastSuccess, toastError } from '@/lib/toast-utils';

export const useUpdateSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) => actualizarSocio(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      queryClient.invalidateQueries({ queryKey: ['socios', data.id] });
      toastSuccess(
        'Socio actualizado exitosamente',
        `${data.razon_social} - RUC: ${data.ruc}`
      );
    },
    onError: (error) => {
      toastError(error, 'Error al actualizar Socio');
    },
  });
};