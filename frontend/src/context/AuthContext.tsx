import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginCredentials, RegisterData } from '../services/auth.service';
import tokenService from '../services/token.service';

// Tipos del contexto
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Crear contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  // Función para verificar autenticación
  const checkAuth = async (): Promise<void> => {
    try {
      const storedToken = tokenService.getToken();
      
      if (!storedToken || tokenService.isTokenExpired(storedToken)) {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Obtener perfil del usuario
      const response = await authService.getProfile();
      
      if (response.success && response.data) {
        setUser(response.data as User);
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        tokenService.removeToken();
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      tokenService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data?.token && response.data?.usuario) {
        setToken(response.data.token);
        setUser(response.data.usuario);
        setIsAuthenticated(true);
        return { success: true, message: response.mensaje };
      }
      
      return { success: false, message: response.mensaje };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  // Registro
  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        return { success: true, message: response.mensaje };
      }
      
      // Si hay errores de validación, mostrar el primero
      if (response.errores && response.errores.length > 0) {
        return { success: false, message: response.errores[0].msg };
      }
      
      return { success: false, message: response.mensaje };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        message: error.message || 'Error al registrar usuario' 
      };
    }
  };

  // Logout
  const logout = (): void => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};