import { useQuery } from '@tanstack/react-query';
import { obtenerSocio } from '../services/socios.service';

export const useSocio = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['socios', id],
    queryFn: () => obtenerSocio(id),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
};