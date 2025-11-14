import { useQuery } from '@tanstack/react-query';
import * as marcasService from '../services/marcas.service';

export const useMarcasActivas = () => {
  return useQuery({
    queryKey: ['marcas', 'activas'],
    queryFn: () => marcasService.obtenerMarcasActivas(),
  });
};