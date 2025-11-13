import { useQuery } from '@tanstack/react-query';
import { listarTiendas } from '../services/tiendas.service';

export const useTiendasActivas = () => {
  return useQuery({
    queryKey: ['tiendas', 'activas'],
    queryFn: () => listarTiendas({ activo: true, limit: 1000 }),
    select: (data) => data.data, // Extrae solo el array de tiendas
  });
};