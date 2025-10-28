import { useQuery } from '@tanstack/react-query';
import { listarOrdenesCompra } from '../services/ordenes_compra.service';

/**
 * Hook para obtener todas las órdenes activas
 * Usado en combos/selects
 */
export const useOrdenesCompraActivas = () => {
  return useQuery({
    queryKey: ['ordenes-compra', 'activas'],
    queryFn: () =>
      listarOrdenesCompra({
        activo: true,
        limit: 1000, // Traer todas las activas
        ordenar_por: 'fecha_creacion',
        orden: 'DESC',
      }),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};