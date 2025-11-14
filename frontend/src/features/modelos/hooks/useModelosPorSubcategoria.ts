import { useQuery } from '@tanstack/react-query';
import * as modelosService from '../services/modelos.service';

export const useModelosPorSubcategoria = (subcategoriaId: number) => {
  return useQuery({
    queryKey: ['modelos', 'subcategoria', subcategoriaId],
    queryFn: () => modelosService.obtenerModelosPorSubcategoria(subcategoriaId),
    enabled: !!subcategoriaId,
  });
};