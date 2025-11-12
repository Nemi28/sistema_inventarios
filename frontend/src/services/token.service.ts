import { jwtDecode } from 'jwt-decode';
import { TOKEN_KEY } from '../utils/constants';

// Tipos para el payload del token
export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}

class TokenService {
  // Guardar token en localStorage
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Obtener token de localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Eliminar token de localStorage
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Decodificar token
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  // Verificar si el token está expirado
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Obtener datos del usuario desde el token
  getUserFromToken(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    if (this.isTokenExpired(token)) {
      this.removeToken();
      return null;
    }

    return this.decodeToken(token);
  }
}

const tokenService = new TokenService();
export default tokenService;