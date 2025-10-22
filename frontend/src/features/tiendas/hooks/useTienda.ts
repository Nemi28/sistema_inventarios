import { useQuery } from '@tanstack/react-query';
import { obtenerTienda } from '../services/tiendas.service';

export const useTienda = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['tiendas', id],
    queryFn: () => obtenerTienda(id),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};