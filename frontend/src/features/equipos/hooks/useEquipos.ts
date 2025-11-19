import { useQuery } from '@tanstack/react-query';
import { listarEquipos, ListarEquiposParams } from '../services/equipos.service';

export const useEquipos = (params: ListarEquiposParams = {}) => {
  return useQuery({
    queryKey: ['equipos', params],
    queryFn: () => listarEquipos(params),
  });
};