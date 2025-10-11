import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, API_TIMEOUT, ERROR_MESSAGES } from '../utils/constants';
import tokenService from './token.service';

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
    if (!error.response) {
      // Error de red
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        originalError: error,
      });
    }

    // Error del servidor
    const status = error.response.status;

    if (status === 401) {
      // Token expirado o inválido
      tokenService.removeToken();
      window.location.href = '/login';
      return Promise.reject({
        message: ERROR_MESSAGES.SESSION_EXPIRED,
        originalError: error,
      });
    }

    if (status === 403) {
      return Promise.reject({
        message: ERROR_MESSAGES.UNAUTHORIZED,
        originalError: error,
      });
    }

    if (status >= 500) {
      return Promise.reject({
        message: ERROR_MESSAGES.SERVER_ERROR,
        originalError: error,
      });
    }

    // Retornar el error original para otros casos
    return Promise.reject(error);
  }
);

export default api;