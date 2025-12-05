import { useMutation, useQueryClient } from '@tanstack/react-query';
import { desinstalarAccesorio } from '../services/movimientos.service';
import { toast } from 'sonner';

export const useDesinstalarAccesorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accesorioId, observaciones }: { accesorioId: number; observaciones?: string }) =>
      desinstalarAccesorio(accesorioId, observaciones),
    onSuccess: () => {
      toast.success('Accesorio desinstalado correctamente');
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      queryClient.invalidateQueries({ queryKey: ['accesorios-instalados'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al desinstalar accesorio');
    },
  });
};