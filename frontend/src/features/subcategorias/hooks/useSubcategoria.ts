import { useQuery } from '@tanstack/react-query';
import * as subcategoriasService from '../services/subcategorias.service';

export const useSubcategoria = (id: number) => {
  return useQuery({
    queryKey: ['subcategoria', id],
    queryFn: () => subcategoriasService.obtenerSubcategoria(id),
    enabled: !!id,
  });
};