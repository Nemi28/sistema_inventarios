import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface SKU {
  id: number;
  codigo_sku: string;
  descripcion_sku: string;
  activo: boolean;
}

export const useSkusActivos = () => {
  return useQuery<SKU[], Error>({
    queryKey: ['skus', 'activos'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: SKU[] }>('/api/skus', {
        params: { activo: true, limit: 1000 }
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};