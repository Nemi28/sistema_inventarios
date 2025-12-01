import { User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { EquiposUbicacionCards } from './EquiposUbicacionCards';
import { EquiposEstadoCards } from './EquiposEstadoCards';
import { ActividadMovimientosCards } from './ActividadMovimientosCards';
import { AlertasOperativasPanel } from './AlertasOperativasPanel';
import { DashboardCharts } from './DashboardCharts';
import { DashboardTables } from './DashboardTables';
import { ResumenCatalogoPanel } from './ResumenCatalogoPanel';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { isAdmin, isGestor } = usePermissions();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-blue-100">Sistema de Gestión de Inventarios</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
            <User size={20} />
            <div>
              <p className="font-medium">{user?.nombre}</p>
              <p className="text-xs text-blue-200 capitalize">{user?.rol}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Completo - Solo para Admin y Gestor */}
      {(isAdmin || isGestor) ? (
        <>
          {/* Sección 1: KPIs de Equipos por Ubicación */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Equipos por Ubicación
            </h2>
            <EquiposUbicacionCards />
          </section>

          {/* Sección 2: KPIs de Equipos por Estado */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-600 rounded-full"></span>
              Estado de Equipos
            </h2>
            <EquiposEstadoCards />
          </section>

          {/* Sección 3: Actividad de Movimientos */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
              Actividad de Movimientos
            </h2>
            <ActividadMovimientosCards />
          </section>

          {/* Sección 4: Alertas Operativas */}
          <section>
            <AlertasOperativasPanel />
          </section>

          {/* Sección 5: Gráficos */}
          <section>
            <DashboardCharts />
          </section>

          {/* Sección 6: Tablas Recientes */}
          <section>
            <DashboardTables />
          </section>

          {/* Sección 7: Resumen de Catálogo (colapsable) */}
          <section>
            <ResumenCatalogoPanel />
          </section>
        </>
      ) : (
        /* Panel para Operador */
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Panel de Consulta
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Como <span className="font-semibold text-emerald-600">Operador</span> tienes 
            acceso de lectura para consultar productos, equipos e inventario del sistema.
          </p>
        </div>
      )}
    </div>
  );
};