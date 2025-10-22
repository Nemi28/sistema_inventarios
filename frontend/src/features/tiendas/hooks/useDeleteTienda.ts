import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarTienda, reactivarTienda } from '../services/tiendas.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { Tienda } from '../types';

export const useDeleteTienda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number; tienda: Tienda }) => {
      return eliminarTienda(id);
    },
    onMutate: async ({ id, tienda }) => {
      await queryClient.cancelQueries({ queryKey: ['tiendas'] });
      
      const previousData = queryClient.getQueryData(['tiendas']);
      
      console.log('🗑️ Tienda recibida para eliminar:', tienda);
      
      if (previousData) {
        queryClient.setQueryData(['tiendas'], (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.filter((t: Tienda) => t.id !== id),
            paginacion: {
              ...old.paginacion,
              total: old.paginacion.total - 1,
            },
          };
        });
      }
      
      return { previousData, deletedTienda: tienda };
    },
    onError: (error, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['tiendas'], context.previousData);
      }
      toastError(error, 'Error al eliminar Tienda');
    },
    onSuccess: async (_, { id }, context) => {
      console.log('✅ onSuccess - context:', context);
      const tiendaToRestore = context?.deletedTienda;
      console.log('📦 tiendaToRestore:', tiendaToRestore);
      
      toast.success('Tienda eliminada', {
        description: 'La tienda ha sido desactivada exitosamente',
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            console.log('🔄 Click en Deshacer');
            console.log('Tienda a restaurar:', tiendaToRestore);
            
            if (!tiendaToRestore) {
              toast.error('No se puede reactivar', {
                description: 'No se encontró la información de la tienda'
              });
              return;
            }
            
            try {
              const resultado = await reactivarTienda(id, {
                pdv: tiendaToRestore.pdv,
                tipo_local: tiendaToRestore.tipo_local,
                perfil_local: tiendaToRestore.perfil_local,
                nombre_tienda: tiendaToRestore.nombre_tienda,
                socio_id: tiendaToRestore.socio_id,
                direccion: tiendaToRestore.direccion,
                ubigeo: tiendaToRestore.ubigeo,
              });
              
              console.log('✅ Resultado de reactivar:', resultado);
              
              await queryClient.invalidateQueries({ queryKey: ['tiendas'] });
              await queryClient.refetchQueries({ 
                queryKey: ['tiendas'], 
                type: 'active' 
              });
              
              toast.success('Tienda reactivada', {
                description: 'La tienda ha sido reactivada exitosamente'
              });
            } catch (error) {
              console.error('❌ Error al reactivar:', error);
              toastError(error, 'Error al reactivar Tienda');
            }
          },
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tiendas'] });
    },
  });
};