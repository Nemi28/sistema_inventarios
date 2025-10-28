import { useQuery } from '@tanstack/react-query';
import { obtenerOrdenCompra } from '../services/ordenes_compra.service';

export const useOrdenCompra = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['ordenes-compra', id],
    queryFn: () => obtenerOrdenCompra(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};