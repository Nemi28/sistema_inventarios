import { useQuery } from '@tanstack/react-query';
import { listarCategorias, ListarCategoriasParams } from '../services/categorias.service';

export const useCategorias = (params: ListarCategoriasParams = {}) => {
  return useQuery({
    queryKey: ['categorias', params],
    queryFn: () => listarCategorias(params),
    staleTime: 5 * 60 * 1000,
  });
};