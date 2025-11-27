import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearMovimiento } from '../services/movimientos.service';
import { CrearMovimientoRequest } from '../types';
import { toast } from 'sonner';

export const useCrearMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearMovimientoRequest) => crearMovimiento(data),
    onSuccess: (data) => {
      const mensaje =
        data.cantidad === 1
          ? 'Movimiento registrado exitosamente'
          : `${data.cantidad} equipos movidos exitosamente`;
      
      toast.success(mensaje);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['equipos-almacen'] });
      queryClient.invalidateQueries({ queryKey: ['equipos-tiendas'] });
      queryClient.invalidateQueries({ queryKey: ['equipos-personas'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al crear movimiento');
    },
  });
};