import { useQuery } from '@tanstack/react-query';
import { buscarOrdenesCompra } from '../services/ordenes_compra.service';

export const useSearchOrdenesCompra = (
  termino: string,
  page = 1,
  limit = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: ['ordenes-compra', 'buscar', termino, page, limit],
    queryFn: () => buscarOrdenesCompra(termino, page, limit),
    enabled: enabled && termino.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};