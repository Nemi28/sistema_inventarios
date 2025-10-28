import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarOrdenCompra, reactivarOrdenCompra } from '../services/ordenes_compra.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { OrdenCompra } from '../types';

export const useDeleteOrdenCompra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eliminarOrdenCompra,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['ordenes-compra'] });
      
      const previousData = queryClient.getQueryData(['ordenes-compra']);
      
      if (previousData) {
        queryClient.setQueryData(['ordenes-compra'], (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.filter((oc: OrdenCompra) => oc.id !== id),
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
        queryClient.setQueryData(['ordenes-compra'], context.previousData);
      }
      toastError(error, 'Error al eliminar Orden de Compra');
    },
    onSuccess: (_, id) => {
      toast.success('Orden de Compra eliminada', {
        description: 'La orden ha sido desactivada exitosamente',
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            try {
              await reactivarOrdenCompra(id);
              queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
              toast.success('Orden de Compra reactivada');
            } catch (error) {
              toastError(error, 'Error al reactivar Orden de Compra');
            }
          },
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] });
    },
  });
};