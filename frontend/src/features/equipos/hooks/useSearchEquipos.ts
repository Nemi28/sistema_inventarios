import { useQuery } from '@tanstack/react-query';
import { buscarEquipos } from '../services/equipos.service';

export const useSearchEquipos = (
  termino: string,
  page = 1,
  limit = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: ['equipos', 'buscar', termino, page, limit],
    queryFn: () => buscarEquipos(termino, page, limit),
    enabled: enabled && termino.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};