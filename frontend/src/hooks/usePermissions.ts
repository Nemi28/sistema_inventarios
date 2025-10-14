import { useAuth } from './useAuth';

interface UsePermissions {
  hasPermission: (allowedRoles: string[]) => boolean;
  canAccess: (requiredRole: string) => boolean;
  userRole: string;
  isAdmin: boolean;
  isGestor: boolean;
  isOperador: boolean;
}

export const usePermissions = (): UsePermissions => {
  const { user } = useAuth();

  const userRole = user?.rol || '';

  const hasPermission = (allowedRoles: string[]): boolean => {
    if (!user || !user.rol) return false;
    return allowedRoles.includes(user.rol);
  };

  const canAccess = (requiredRole: string): boolean => {
    if (!user || !user.rol) return false;
    return user.rol === requiredRole;
  };

  const isAdmin = userRole === 'administrador';
  const isGestor = userRole === 'gestor';
  const isOperador = userRole === 'operador';

  return {
    hasPermission,
    canAccess,
    userRole,
    isAdmin,
    isGestor,
    isOperador,
  };
};