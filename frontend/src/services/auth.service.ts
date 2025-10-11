import api from './api';
import tokenService from './token.service';
import { ENDPOINTS } from '../utils/constants';

// Tipos de datos
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol_id: number;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo?: boolean;
  fecha_creacion?: string;
}

export interface AuthResponse {
  success: boolean;
  mensaje: string;
  data?: {
    token?: string;
    usuario?: User;
    id?: number;
    nombre?: string;
    email?: string;
    rol?: string;
    activo?: boolean;
    fecha_creacion?: string;
  };
  errores?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

class AuthService {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      // Si el login es exitoso y hay token, guardarlo
      if (response.data.success && response.data.data?.token) {
        tokenService.setToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Registro
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>(ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Logout
  logout(): void {
    tokenService.removeToken();
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = tokenService.getToken();
    if (!token) return false;
    return !tokenService.isTokenExpired(token);
  }

  // Obtener usuario actual desde el token
  getCurrentUser(): User | null {
    const payload = tokenService.getUserFromToken();
    if (!payload) return null;

    return {
      id: payload.id,
      nombre: '',
      email: payload.email,
      rol: payload.rol,
    };
  }
}

export default new AuthService();