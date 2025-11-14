import { useQuery } from '@tanstack/react-query';
import * as modelosService from '../services/modelos.service';

export const useModelo = (id: number) => {
  return useQuery({
    queryKey: ['modelo', id],
    queryFn: () => modelosService.obtenerModelo(id),
    enabled: !!id,
  });
};