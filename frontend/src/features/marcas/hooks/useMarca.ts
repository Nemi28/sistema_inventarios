import { useQuery } from '@tanstack/react-query';
import * as marcasService from '../services/marcas.service';

export const useMarca = (id: number) => {
  return useQuery({
    queryKey: ['marca', id],
    queryFn: () => marcasService.obtenerMarca(id),
    enabled: !!id,
  });
};