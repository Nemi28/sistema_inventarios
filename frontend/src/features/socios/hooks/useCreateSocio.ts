import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearSocio } from '../services/socios.service';
import { toastSuccess, toastError } from '@/lib/toast-utils';

export const useCreateSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearSocio,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toastSuccess(
        'Socio creado exitosamente',
        `${data.razon_social} - RUC: ${data.ruc}`
      );
    },
    onError: (error) => {
      toastError(error, 'Error al crear Socio');
    },
  });
};