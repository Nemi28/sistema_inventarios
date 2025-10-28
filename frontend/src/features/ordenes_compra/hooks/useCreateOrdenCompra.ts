import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearOrdenCompra } from '../services/ordenes_compra.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';

export const useCreateOrdenCompra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearOrdenCompra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
      toast.success('Orden de Compra creada', {
        description: 'La orden ha sido registrada exitosamente',
      });
    },
    onError: (error) => {
      toastError(error, 'Error al crear Orden de Compra');
    },
  });
};