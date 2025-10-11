// URL base de la API desde variables de entorno
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Timeout de peticiones HTTP
export const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '10000');

// Key para localStorage
export const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'inventory_token';

// Endpoints de la API
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/perfil',
  },
};

// Roles disponibles
export const ROLES = {
  ADMINISTRADOR: 'administrador',
  GESTOR: 'gestor',
  OPERADOR: 'operador',
};

// Mensajes de error genéricos
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Intenta nuevamente más tarde.',
  UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
};