import { useQuery } from '@tanstack/react-query';
import { obtenerSKUsActivos } from '../services/guias.service';
import { SKU } from '../types';

/**
 * Hook para obtener lista de SKUs activos
 * GET /api/guias/skus
 */
export const useSKUsActivos = () => {
  return useQuery<SKU[], Error>({
    queryKey: ['guias', 'skus'],
    queryFn: obtenerSKUsActivos,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};