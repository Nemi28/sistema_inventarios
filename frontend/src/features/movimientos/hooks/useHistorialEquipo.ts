import { useQuery } from '@tanstack/react-query';
import { obtenerHistorialEquipo } from '../services/movimientos.service';

export const useHistorialEquipo = (equipoId: number | null) => {
  return useQuery({
    queryKey: ['historial-equipo', equipoId],
    queryFn: () => obtenerHistorialEquipo(equipoId!),
    enabled: !!equipoId,
  });
};