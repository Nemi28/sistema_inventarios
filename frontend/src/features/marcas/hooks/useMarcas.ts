import { useQuery } from '@tanstack/react-query';
import * as marcasService from '../services/marcas.service';

export const useMarcas = (params?: marcasService.ListarMarcasParams) => {
  return useQuery({
    queryKey: ['marcas', params],
    queryFn: () => marcasService.listarMarcas(params),
  });
};