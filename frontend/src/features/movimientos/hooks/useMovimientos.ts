import { useQuery } from '@tanstack/react-query';
import { listarMovimientos } from '../services/movimientos.service';
import { MovimientoFilters } from '../types';

export const useMovimientos = (params: MovimientoFilters = {}) => {
  return useQuery({
    queryKey: ['movimientos', params],
    queryFn: () => listarMovimientos(params),
    staleTime: 0,
    gcTime: 0,
  });
};