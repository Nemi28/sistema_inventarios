import { useQuery } from '@tanstack/react-query';
import { obtenerAccesoriosInstalados } from '@/features/movimientos/services/movimientos.service';

export const useAccesoriosInstalados = (equipoId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['accesorios-instalados', equipoId],
    queryFn: () => obtenerAccesoriosInstalados(equipoId),
    enabled: options?.enabled !== false && equipoId > 0,
  });
};