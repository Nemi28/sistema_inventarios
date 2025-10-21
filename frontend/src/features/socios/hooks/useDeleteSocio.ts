import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarSocio, reactivarSocio } from '../services/socios.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { Socio } from '../types';

export const useDeleteSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number; socio: Socio }) => {
      return eliminarSocio(id);
    },
    onMutate: async ({ id, socio }) => {
      await queryClient.cancelQueries({ queryKey: ['socios'] });
      
      const previousData = queryClient.getQueryData(['socios']);
      
      console.log('🗑️ Socio recibido para eliminar:', socio);
      
      if (previousData) {
        queryClient.setQueryData(['socios'], (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.filter((s: Socio) => s.id !== id),
            paginacion: {
              ...old.paginacion,
              total: old.paginacion.total - 1,
            },
          };
        });
      }
      
      return { previousData, deletedSocio: socio };
    },
    onError: (error, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['socios'], context.previousData);
      }
      toastError(error, 'Error al eliminar Socio');
    },
    onSuccess: async (_, { id }, context) => {
      console.log('✅ onSuccess - context:', context);
      const socioToRestore = context?.deletedSocio;
      console.log('📦 socioToRestore:', socioToRestore);
      
      toast.success('Socio eliminado', {
        description: 'El Socio ha sido desactivado exitosamente',
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            console.log('🔄 Click en Deshacer');
            console.log('Socio a restaurar:', socioToRestore);
            
            if (!socioToRestore) {
              toast.error('No se puede reactivar', {
                description: 'No se encontró la información del socio'
              });
              return;
            }
            
            try {
              const resultado = await reactivarSocio(id, {
                razon_social: socioToRestore.razon_social,
                ruc: socioToRestore.ruc,
                direccion: socioToRestore.direccion,
              });
              
              console.log('✅ Resultado de reactivar:', resultado);
              
              await queryClient.invalidateQueries({ queryKey: ['socios'] });
              await queryClient.refetchQueries({ queryKey: ['socios'], type: 'active' });
              
              toast.success('Socio reactivado', {
                description: 'El socio ha sido reactivado exitosamente'
              });
            } catch (error) {
              console.error('❌ Error al reactivar:', error);
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