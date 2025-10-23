import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generarGuiaExcel } from '../services/guias.service';
import { GuiaFormData } from '../types';

/**
 * Hook para generar y descargar guía de remisión en Excel
 * POST /api/guias/generar-excel
 */
export const useGenerarGuia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GuiaFormData) => generarGuiaExcel(data),
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['guias'] });
      
      toast.success('Guía generada correctamente', {
        description: 'El archivo Excel se ha descargado automáticamente',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al generar guía', {
        description: error.message || 'Ocurrió un error al generar el archivo',
      });
    },
  });
};