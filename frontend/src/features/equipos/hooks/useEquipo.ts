import { useQuery } from '@tanstack/react-query';
import { obtenerEquipo } from '../services/equipos.service';

export const useEquipo = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['equipos', id],
    queryFn: () => obtenerEquipo(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};