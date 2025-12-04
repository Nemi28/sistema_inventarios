import { useQuery } from '@tanstack/react-query';
import { obtenerEquiposParaInstalacion } from '../services/movimientos.service';
import { EquipoParaInstalacion } from '../types';

/**
 * Hook para obtener equipos de una tienda disponibles para instalar accesorios
 */
export const useEquiposParaInstalacion = (
  tiendaId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery<EquipoParaInstalacion[]>({
    queryKey: ['equipos-para-instalacion', tiendaId],
    queryFn: () => obtenerEquiposParaInstalacion(tiendaId),
    enabled: options?.enabled !== false && tiendaId > 0,
    staleTime: 30000,
  });
};