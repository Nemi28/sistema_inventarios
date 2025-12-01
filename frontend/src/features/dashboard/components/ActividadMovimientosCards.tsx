import { TrendingUp, TrendingDown, Minus, Activity, Calendar, CalendarDays } from 'lucide-react';
import { useActividadMovimientos } from '../hooks/useDashboard';

export const ActividadMovimientosCards = () => {
  const { data, isLoading } = useActividadMovimientos();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const porcentaje = data?.porcentaje_crecimiento || 0;
  
  const getTrendIcon = () => {
    if (porcentaje > 0) return <TrendingUp className="text-emerald-500" size={20} />;
    if (porcentaje < 0) return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-500" size={20} />;
  };

  const getTrendColor = () => {
    if (porcentaje > 0) return 'text-emerald-600';
    if (porcentaje < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendBg = () => {
    if (porcentaje > 0) return 'bg-emerald-50';
    if (porcentaje < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Movimientos Hoy */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">Movimientos Hoy</p>
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Activity size={18} className="text-indigo-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{data?.hoy || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Registrados hoy</p>
      </div>

      {/* Movimientos Mes */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">Este Mes</p>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar size={18} className="text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{data?.mes_actual || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Mes anterior: {data?.mes_anterior || 0}</p>
      </div>

      {/* Crecimiento */}
      <div className={`rounded-xl shadow-sm border p-5 ${getTrendBg()}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">Variación Mensual</p>
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <CalendarDays size={18} className="text-gray-600" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className={`text-3xl font-bold ${getTrendColor()}`}>
            {porcentaje > 0 ? '+' : ''}{porcentaje}%
          </p>
          {getTrendIcon()}
        </div>
        <p className="text-xs text-gray-500 mt-1">vs. mes anterior</p>
      </div>
    </div>
  );
};