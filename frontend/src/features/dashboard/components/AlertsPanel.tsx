import { AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useAlertasIndicadores } from '../hooks/useDashboardStats';

export const AlertsPanel = () => {
  const { data, isLoading } = useAlertasIndicadores();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-100 rounded"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const alertas = [
    {
      label: 'Categorías sin modelos',
      value: data?.alertas.categoriasVacias || 0,
      icon: AlertTriangle,
      color: data?.alertas.categoriasVacias ? 'red' : 'green',
    },
    {
      label: 'Socios sin tiendas',
      value: data?.alertas.sociosSinTiendas || 0,
      icon: AlertTriangle,
      color: data?.alertas.sociosSinTiendas ? 'yellow' : 'green',
    },
    {
      label: 'Marcas sin modelos',
      value: data?.alertas.marcasSinModelos || 0,
      icon: AlertTriangle,
      color: data?.alertas.marcasSinModelos ? 'yellow' : 'green',
    },
  ];

  const indicadores = [
    {
      label: 'Completitud del Catálogo',
      value: `${data?.indicadores.tasaCompletitudCatalogo || 0}%`,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Concentración Top 3 Marcas',
      value: `${data?.indicadores.concentracionTopMarcas || 0}%`,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Diversidad de Catálogo',
      value: `${data?.indicadores.diversidadCatalogo || 0} marcas`,
      icon: BarChart3,
      color: 'purple',
    },
  ];

  const colorClasses = {
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-300',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      border: 'border-yellow-300',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-300',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-300',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-300',
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Alertas e Indicadores
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Alertas del Sistema
          </h4>
          <div className="space-y-3">
            {alertas.map((alerta, index) => {
              const Icon = alerta.icon;
              const colors =
                colorClasses[alerta.color as keyof typeof colorClasses];
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={colors.text} size={20} />
                    <span className="text-sm font-medium text-gray-700">
                      {alerta.label}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${colors.text}`}>
                    {alerta.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicadores */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-500" />
            Indicadores de Gestión
          </h4>
          <div className="space-y-3">
            {indicadores.map((indicador, index) => {
              const Icon = indicador.icon;
              const colors =
                colorClasses[indicador.color as keyof typeof colorClasses];
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={colors.text} size={20} />
                    <span className="text-sm font-medium text-gray-700">
                      {indicador.label}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${colors.text}`}>
                    {indicador.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};