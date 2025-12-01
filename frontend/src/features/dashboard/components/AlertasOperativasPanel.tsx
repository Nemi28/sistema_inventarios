import { AlertTriangle, Clock, PackageX, Truck } from 'lucide-react';
import { useAlertasOperativas } from '../hooks/useDashboard';

export const AlertasOperativasPanel = () => {
  const { data, isLoading } = useAlertasOperativas();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const alertas = [
    {
      label: 'En Tránsito > 7 días',
      value: data?.en_transito_largo || 0,
      icon: AlertTriangle,
      color: data?.en_transito_largo && data.en_transito_largo > 0 ? 'red' : 'green',
      description: 'Requieren seguimiento urgente',
    },
    {
      label: 'Pendientes',
      value: data?.pendientes || 0,
      icon: Clock,
      color: data?.pendientes && data.pendientes > 0 ? 'yellow' : 'green',
      description: 'Movimientos sin procesar',
    },
    {
      label: 'Sin Movimiento',
      value: data?.sin_movimiento_30_dias || 0,
      icon: PackageX,
      color: data?.sin_movimiento_30_dias && data.sin_movimiento_30_dias > 5 ? 'yellow' : 'green',
      description: 'Más de 30 días en almacén',
    },
    {
      label: 'Total En Tránsito',
      value: data?.en_transito_total || 0,
      icon: Truck,
      color: 'blue',
      description: 'Equipos viajando',
    },
  ];

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      value: 'text-red-700',
    },
    yellow: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      value: 'text-amber-700',
    },
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'bg-emerald-100 text-emerald-600',
      value: 'text-emerald-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-700',
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="text-amber-500" size={22} />
        <h3 className="text-lg font-bold text-gray-900">Alertas Operativas</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {alertas.map((alerta) => {
          const Icon = alerta.icon;
          const colors = colorClasses[alerta.color as keyof typeof colorClasses];
          
          return (
            <div
              key={alerta.label}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colors.icon}`}>
                  <Icon size={18} />
                </div>
                <span className={`text-2xl font-bold ${colors.value}`}>
                  {alerta.value}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">{alerta.label}</p>
              <p className="text-xs text-gray-500 mt-1">{alerta.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};