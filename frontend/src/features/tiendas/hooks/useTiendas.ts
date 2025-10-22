import { useQuery } from '@tanstack/react-query';
import { listarTiendas, ListarTiendasParams } from '../services/tiendas.service';

export const useTiendas = (params: ListarTiendasParams = {}) => {
  return useQuery({
    queryKey: ['tiendas', params],
    queryFn: () => listarTiendas(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};