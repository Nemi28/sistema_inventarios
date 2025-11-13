import { useMutation } from '@tanstack/react-query';
import { generarActaPDF } from '../services/actas.service';
import { GenerarActaFormData } from '../types';
import { toast } from 'sonner';

export const useGenerarActa = () => {
  return useMutation({
    mutationFn: (data: GenerarActaFormData) => generarActaPDF(data),
    onSuccess: (blob, variables) => {
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento <a> para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = `${variables.ticket}.pdf`;
      
      // Simular click para descargar
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF generado correctamente');
    },
    onError: (error: any) => {
      console.error('Error al generar PDF:', error);
      toast.error(
        error.response?.data?.mensaje || 
        'Error al generar el PDF. Intenta nuevamente.'
      );
    },
  });
};