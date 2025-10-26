import { useQuery } from '@tanstack/react-query';
import { buscarCategorias } from '../services/categorias.service';

export const useSearchCategorias = (
  termino: string,
  page = 1,
  limit = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: ['categorias', 'search', termino, page],
    queryFn: () => buscarCategorias(termino, page, limit),
    enabled: enabled && termino.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};