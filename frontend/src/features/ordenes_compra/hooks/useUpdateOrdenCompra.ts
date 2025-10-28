import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarOrdenCompra } from '../services/ordenes_compra.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { OrdenCompra } from '../types';

export const useUpdateOrdenCompra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<OrdenCompra>) =>
      actualizarOrdenCompra(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
      toast.success('Orden de Compra actualizada', {
        description: 'La orden ha sido actualizada exitosamente',
      });
    },
    onError: (error) => {
      toastError(error, 'Error al actualizar Orden de Compra');
    },
  });
};