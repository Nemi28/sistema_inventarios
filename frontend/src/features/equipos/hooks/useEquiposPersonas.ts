import { useQuery } from '@tanstack/react-query';
import { listarEquiposPersonas, ListarEquiposParams } from '../services/equipos.service';

export const useEquiposPersonas = (params: ListarEquiposParams = {}) => {
  return useQuery({
    queryKey: ['equipos-personas', params],
    queryFn: () => listarEquiposPersonas(params),
    staleTime: 0,
    gcTime: 0,
  });
};