import { useQuery } from '@tanstack/react-query';
import { buscarSKUs } from '../services/skus.service';

export const useSearchSKUs = (
  termino: string,
  page = 1,
  limit = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: ['skus', 'search', termino, page],
    queryFn: () => buscarSKUs(termino, page, limit),
    enabled: enabled && termino.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};