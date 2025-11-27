import { useQuery } from '@tanstack/react-query';
import { listarEquiposAlmacen, ListarEquiposParams } from '../services/equipos.service';

export const useEquiposAlmacen = (params: ListarEquiposParams = {}) => {
  return useQuery({
    queryKey: ['equipos-almacen', params], // ← Ya está bien, pero asegurémonos
    queryFn: () => listarEquiposAlmacen(params),
    staleTime: 0, // ← CAMBIAR A 0 para que NO cachee
    gcTime: 0, // ← CAMBIAR A 0 para forzar refresh
  });
};