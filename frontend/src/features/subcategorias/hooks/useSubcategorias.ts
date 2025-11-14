import { useQuery } from '@tanstack/react-query';
import * as subcategoriasService from '../services/subcategorias.service';

export const useSubcategorias = (params?: subcategoriasService.ListarSubcategoriasParams) => {
  return useQuery({
    queryKey: ['subcategorias', params],
    queryFn: () => subcategoriasService.listarSubcategorias(params),
  });
};