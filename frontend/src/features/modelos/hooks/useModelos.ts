import { useQuery } from '@tanstack/react-query';
import * as modelosService from '../services/modelos.service';

export const useModelos = (params?: modelosService.ListarModelosParams) => {
  return useQuery({
    queryKey: ['modelos', params],
    queryFn: () => modelosService.listarModelos(params),
  });
};