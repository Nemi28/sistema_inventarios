import api from '@/services/api';
import { GuiaFormData, GenerarGuiaRequest, Tienda, SKU } from '../types';

/**
 * Convierte fecha de YYYY-MM-DD (input date) a DD/MM/YYYY (backend)
 */
const convertirFechaParaBackend = (fecha: string): string => {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
};

/**
 * Genera archivo Excel de guía de remisión
 * POST /api/guias/generar-excel
 */
export const generarGuiaExcel = async (data: GuiaFormData): Promise<void> => {
  try {
    // Convertir fecha al formato del backend
    const request: GenerarGuiaRequest = {
      ...data,
      fecha_inicio_traslado: convertirFechaParaBackend(data.fecha_inicio_traslado),
    };

    // Obtener token del localStorage
    const token = localStorage.getItem('token');

    const response = await api.post('/api/guias/generar-excel', request, {
      responseType: 'blob', // Importante para recibir archivo binario
      headers: {
        'Authorization': `Bearer ${token}`, // Forzar envío de token
      },
    });

    // Crear blob del archivo
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Obtener nombre del archivo del header Content-Disposition
    let filename = 'GRE_GUIA.xlsx';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Asegurar que tenga extensión .xlsx
    if (!filename.endsWith('.xlsx')) {
      filename += '.xlsx';
    }

    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    if (error.response?.data instanceof Blob) {
      // Si el error viene como blob, convertirlo a JSON
      const text = await error.response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || 'Error al generar guía');
    }
    throw new Error(error.response?.data?.message || 'Error al generar guía');
  }
};

/**
 * Obtiene lista de tiendas activas
 * GET /api/guias/tiendas
 */
export const obtenerTiendasActivas = async (): Promise<Tienda[]> => {
  const { data } = await api.get<{ success: boolean; data: Tienda[] }>(
    '/api/guias/tiendas'
  );
  return data.data;
};

/**
 * Obtiene lista de SKUs activos
 * GET /api/guias/skus
 */
export const obtenerSKUsActivos = async (): Promise<SKU[]> => {
  const { data } = await api.get<{ success: boolean; data: SKU[] }>(
    '/api/guias/skus'
  );
  return data.data;
};