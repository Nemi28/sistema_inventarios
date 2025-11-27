import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarEstadoMovimiento } from '../services/movimientos.service';
import { ActualizarEstadoRequest } from '../types';
import { toast } from 'sonner';

export const useActualizarEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarEstadoRequest }) =>
      actualizarEstadoMovimiento(id, data),
    onSuccess: () => {
      toast.success('Estado actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['historial-equipo'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar estado');
    },
  });
};