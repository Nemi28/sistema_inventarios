import { useQuery } from '@tanstack/react-query';
import { obtenerTiendasActivas } from '../services/guias.service';
import { Tienda } from '../types';

/**
 * Hook para obtener lista de tiendas activas
 * GET /api/guias/tiendas
 */
export const useTiendasActivas = () => {
  return useQuery<Tienda[], Error>({
    queryKey: ['guias', 'tiendas'],
    queryFn: obtenerTiendasActivas,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};