import { useQuery } from '@tanstack/react-query';
import { listarOrdenesCompra, ListarOrdenesCompraParams } from '../services/ordenes_compra.service';

export const useOrdenesCompra = (params: ListarOrdenesCompraParams = {}) => {
  return useQuery({
    queryKey: ['ordenes-compra', params],
    queryFn: () => listarOrdenesCompra(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};