import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as marcasService from '../services/marcas.service';

export const useCrearMarca = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marcasService.crearMarca,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcas'] });
      toast.success('Marca creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al crear marca');
    },
  });
};