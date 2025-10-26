import { useQuery } from '@tanstack/react-query';
import { obtenerCategoria } from '../services/categorias.service';

export const useCategoria = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['categorias', id],
    queryFn: () => obtenerCategoria(id),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
};