import { useQuery } from '@tanstack/react-query';
import { listarSKUs, ListarSKUsParams } from '../services/skus.service';

export const useSKUs = (params: ListarSKUsParams = {}) => {
  return useQuery({
    queryKey: ['skus', params],
    queryFn: () => listarSKUs(params),
    staleTime: 5 * 60 * 1000,
  });
};