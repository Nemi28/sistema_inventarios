import { useQuery } from '@tanstack/react-query';
import { obtenerSKU } from '../services/skus.service';

export const useSKU = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['skus', id],
    queryFn: () => obtenerSKU(id),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
};