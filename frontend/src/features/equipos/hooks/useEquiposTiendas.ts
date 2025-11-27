import { useQuery } from '@tanstack/react-query';
import { listarEquiposTiendas, ListarEquiposParams } from '../services/equipos.service';

export const useEquiposTiendas = (params: ListarEquiposParams = {}) => {
  return useQuery({
    queryKey: ['equipos-tiendas', params],
    queryFn: () => listarEquiposTiendas(params),
    staleTime: 0,
    gcTime: 0,
  });
};