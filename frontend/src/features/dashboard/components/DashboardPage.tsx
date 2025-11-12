import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { StatsCards } from './StatsCards';
import { ChartsSection } from './ChartsSection';
import { RecentTables } from './RecentTables';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { isAdmin, isGestor } = usePermissions();

  return (
    <div className="space-y-6">
      {/* Mensaje de bienvenida */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Bienvenido, {user?.nombre}!
          </h2>
          <p className="text-gray-600">
            Has iniciado sesión como <span className="font-semibold capitalize">{user?.rol}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards - Solo para Admin y Gestor */}
      {(isAdmin || isGestor) && (
        <>
          <StatsCards />
          <ChartsSection />
          <RecentTables />
        </>
      )}

      {/* Panel de control según rol - Solo para Operador */}
      {!isAdmin && !isGestor && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Panel de Control</h3>
          <div className="text-gray-600">
            <p className="mb-2">
              Como <span className="font-semibold text-green-600">Operador</span> puedes consultar productos e inventario.
            </p>
            <p>Tienes acceso de solo lectura a la información del sistema.</p>
          </div>
        </div>
      )}
    </div>
  );
};