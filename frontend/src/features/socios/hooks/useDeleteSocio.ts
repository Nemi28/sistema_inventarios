import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarSocio, reactivarSocio } from '../services/socios.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { Socio } from '../types';

export const useDeleteSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eliminarSocio,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['socios'] });
      
      const previousData = queryClient.getQueryData(['socios']);
      
      if (previousData) {
        queryClient.setQueryData(['socios'], (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.filter((socio: Socio) => socio.id !== id),
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
        queryClient.setQueryData(['socios'], context.previousData);
      }
      toastError(error, 'Error al eliminar Socio');
    },
    onSuccess: (_, id) => {
      toast.success('Socio eliminado', {
        description: 'El Socio ha sido desactivado exitosamente',
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            try {
              await reactivarSocio(id);
              queryClient.invalidateQueries({ queryKey: ['socios'] });
              toast.success('Socio reactivado');
            } catch (error) {
              toastError(error, 'Error al reactivar Socio');
            }
          },
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
    },
  });
};