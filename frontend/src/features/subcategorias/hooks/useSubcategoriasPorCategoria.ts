import { useQuery } from '@tanstack/react-query';
import * as subcategoriasService from '../services/subcategorias.service';

export const useSubcategoriasPorCategoria = (categoriaId: number) => {
  return useQuery({
    queryKey: ['subcategorias', 'categoria', categoriaId],
    queryFn: () => subcategoriasService.obtenerSubcategoriasPorCategoria(categoriaId),
    enabled: !!categoriaId,
  });
};