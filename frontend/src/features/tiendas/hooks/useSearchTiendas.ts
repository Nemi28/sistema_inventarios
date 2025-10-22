import { useQuery } from '@tanstack/react-query';
import { buscarTiendas } from '../services/tiendas.service';

export const useSearchTiendas = (
  termino: string,
  page: number,
  limit: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ['tiendas', 'search', termino, page, limit],
    queryFn: () => buscarTiendas(termino, page, limit),
    enabled: enabled && termino.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};