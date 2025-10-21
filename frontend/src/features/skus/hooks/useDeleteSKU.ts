import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarSKU, reactivarSKU } from '../services/skus.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { SKU } from '../types';

export const useDeleteSKU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eliminarSKU,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['skus'] });
      
      const previousData = queryClient.getQueryData(['skus']);
      
      if (previousData) {
        queryClient.setQueryData(['skus'], (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.filter((sku: SKU) => sku.id !== id),
            paginacion: {
              ...old.paginacion,
              total: old.paginacion.total - 1,
            },
          };
        });
      }
      
      return { previousData };
    },
    onError: (error, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['skus'], context.previousData);
      }
      toastError(error, 'Error al eliminar SKU');
    },
    onSuccess: (_, id) => {
      toast.success('SKU eliminado', {
        description: 'El SKU ha sido desactivado exitosamente',
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            try {
              await reactivarSKU(id);
              queryClient.invalidateQueries({ queryKey: ['skus'] });
              toast.success('SKU reactivado');
            } catch (error) {
              toastError(error, 'Error al reactivar SKU');
            }
          },
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    },
  });
};