import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eliminarEquipo } from '../services/equipos.service';
import { toast } from 'sonner';
import { toastError } from '@/lib/toast-utils';

interface DeleteEquipoParams {
  id: number;
  equipo: { numero_serie?: string; inv_entel?: string };
}

export const useDeleteEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteEquipoParams) => eliminarEquipo(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      const identificador = variables.equipo.inv_entel || variables.equipo.numero_serie || 'Equipo';
      toast.success('Equipo eliminado', {
        description: `${identificador} ha sido eliminado exitosamente`,
      });
    },
    onError: (error) => {
      toastError(error, 'Error al eliminar Equipo');
    },
  });
};