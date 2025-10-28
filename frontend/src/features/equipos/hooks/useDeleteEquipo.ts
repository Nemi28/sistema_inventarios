import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarEquipo, reactivarEquipo } from '../services/equipos.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';
import { Equipo } from '../types';

export const useDeleteEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number; equipo: Equipo }) => {
      return eliminarEquipo(id);
    },
    onMutate: async ({ id, equipo }) => {
      await queryClient.cancelQueries({ queryKey: ['equipos'] });

      const previousData = queryClient.getQueryData(['equipos']);

      console.log('🗑️ Equipo recibido para eliminar:', equipo);

      if (previousData) {
        queryClient.setQueryData(['equipos'], (old: any) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.filter((e: Equipo) => e.id !== id),
            paginacion: {
              ...old.paginacion,
              total: old.paginacion.total - 1,
            },
          };
        });
      }

      return { previousData, deletedEquipo: equipo };
    },
    onError: (error, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['equipos'], context.previousData);
      }
      toastError(error, 'Error al eliminar Equipo');
    },
    onSuccess: async (_, { id }, context) => {
      console.log('✅ onSuccess - context:', context);
      const equipoToRestore = context?.deletedEquipo;
      console.log('📦 equipoToRestore:', equipoToRestore);

      toast.success('Equipo eliminado', {
        description: 'El equipo ha sido desactivado exitosamente',
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            console.log('🔄 Click en Deshacer');
            console.log('Equipo a restaurar:', equipoToRestore);

            if (!equipoToRestore) {
              toast.error('No se puede reactivar', {
                description: 'No se encontró la información del equipo',
              });
              return;
            }

            try {
              const resultado = await reactivarEquipo(id, {
                orden_compra_id: equipoToRestore.orden_compra_id,
                categoria_id: equipoToRestore.categoria_id,
                nombre: equipoToRestore.nombre,
                marca: equipoToRestore.marca,
                modelo: equipoToRestore.modelo,
                numero_serie: equipoToRestore.numero_serie,
                inv_entel: equipoToRestore.inv_entel,
                estado: equipoToRestore.estado,
                observacion: equipoToRestore.observacion,
              });

              console.log('✅ Resultado de reactivar:', resultado);

              await queryClient.invalidateQueries({ queryKey: ['equipos'] });
              await queryClient.refetchQueries({
                queryKey: ['equipos'],
                type: 'active',
              });

              toast.success('Equipo reactivado', {
                description: 'El equipo ha sido reactivado exitosamente',
              });
            } catch (error) {
              console.error('❌ Error al reactivar:', error);
              toastError(error, 'Error al reactivar Equipo');
            }
          },
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
    },
  });
};