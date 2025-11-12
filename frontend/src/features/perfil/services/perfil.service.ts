import api from '@/services/api';
import {
  CambiarPasswordData,
  CambiarPasswordResponse,
  SolicitarRecuperacionData,
  SolicitarRecuperacionResponse,
  ValidarTokenResponse,
  ResetearPasswordData,
  ResetearPasswordResponse,
} from '../types';

export const cambiarPassword = async (
  data: Omit<CambiarPasswordData, 'password_confirmacion'>
): Promise<CambiarPasswordResponse> => {
  const response = await api.put<CambiarPasswordResponse>(
    '/api/password/cambiar',
    data
  );
  return response.data;
};

export const solicitarRecuperacion = async (
  data: SolicitarRecuperacionData
): Promise<SolicitarRecuperacionResponse> => {
  const response = await api.post<SolicitarRecuperacionResponse>(
    '/api/password/solicitar-recuperacion',
    data
  );
  return response.data;
};

export const validarToken = async (token: string): Promise<ValidarTokenResponse> => {
  const response = await api.get<ValidarTokenResponse>(
    `/api/password/validar-token/${token}`
  );
  return response.data;
};

export const resetearPassword = async (
  data: Omit<ResetearPasswordData, 'password_confirmacion'>
): Promise<ResetearPasswordResponse> => {
  const response = await api.post<ResetearPasswordResponse>(
    '/api/password/resetear',
    data
  );
  return response.data;
};