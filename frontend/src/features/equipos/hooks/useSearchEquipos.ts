import { useQuery } from '@tanstack/react-query';
import { buscarEquipos } from '../services/equipos.service';

export const useSearchEquipos = (
  termino: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['equipos', 'buscar', termino, page, limit],
    queryFn: () => buscarEquipos(termino, page, limit),
    enabled: enabled && termino.length > 0,
  });
};