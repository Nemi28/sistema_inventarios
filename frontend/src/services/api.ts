import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import tokenService from './token.service';

// Variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const API_TIMEOUT = Number(process.env.REACT_APP_API_TIMEOUT) || 10000;

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - Agregar token automáticamente
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getToken();
    
    if (token && !tokenService.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - Manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Error de red
    if (!error.response) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Error 401: Sesión expirada
    if (status === 401) {
      tokenService.removeToken();
      window.location.href = '/login';
      toast.error('Sesión expirada', {
        description: 'Por favor, inicia sesión nuevamente',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Error 403: Sin permisos
    if (status === 403) {
      toast.error('Sin permisos', {
        description: 'No tienes autorización para realizar esta acción',
        duration: 4000,
      });
      return Promise.reject(error);
    }

    // Error 500: Error del servidor
    if (status >= 500) {
      toast.error('Error del servidor', {
        description: 'Ocurrió un problema. Intenta nuevamente.',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Retornar el error original para otros casos
    return Promise.reject(error);
  }
);

export default api;