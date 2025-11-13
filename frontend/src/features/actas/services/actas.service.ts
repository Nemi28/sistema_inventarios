import api from '@/services/api';
import { GenerarActaFormData } from '../types';

export const generarActaPDF = async (data: GenerarActaFormData): Promise<Blob> => {
  const response = await api.post('/api/actas/generar-pdf', data, {
    responseType: 'blob',
  });
  
  return response.data;
};