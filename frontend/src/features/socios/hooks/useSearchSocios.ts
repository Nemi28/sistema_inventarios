import { useQuery } from '@tanstack/react-query';
import { buscarSocios } from '../services/socios.service';

export const useSearchSocios = (
  termino: string,
  page = 1,
  limit = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: ['socios', 'search', termino, page],
    queryFn: () => buscarSocios(termino, page, limit),
    enabled: enabled && termino.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};