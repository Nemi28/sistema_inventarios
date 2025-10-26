import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarCategoria, reactivarCategoria } from '../services/categorias.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { Categoria } from '../types';

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eliminarCategoria,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categorias'] });
      
      const previousData = queryClient.getQueryData(['categorias']);
      
      if (previousData) {
        queryClient.setQueryData(['categorias'], (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.filter((categoria: Categoria) => categoria.id !== id),
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
        queryClient.setQueryData(['categorias'], context.previousData);
      }
      toastError(error, 'Error al eliminar categoría');
    },
    onSuccess: (_, id) => {
      toast.success('Categoría eliminada', {
        description: 'La categoría ha sido desactivada exitosamente',
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            try {
              await reactivarCategoria(id);
              queryClient.invalidateQueries({ queryKey: ['categorias'] });
              toast.success('Categoría reactivada');
            } catch (error) {
              toastError(error, 'Error al reactivar categoría');
            }
          },
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
};