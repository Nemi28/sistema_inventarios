import { useQuery } from '@tanstack/react-query';
import { listarSocios, ListarSociosParams } from '../services/socios.service';

export const useSocios = (params: ListarSociosParams = {}) => {
  return useQuery({
    queryKey: ['socios', params],
    queryFn: () => listarSocios(params),
    staleTime: 5 * 60 * 1000,
  });
};