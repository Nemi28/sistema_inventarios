import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTasaCrecimiento } from '../hooks/useDashboardStats';

export const GrowthIndicators = () => {
  const { data, isLoading } = useTasaCrecimiento();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const indicators = [
    {
      label: 'SKUs',
      mesActual: data?.skus.mesActual || 0,
      mesAnterior: data?.skus.mesAnterior || 0,
      porcentaje: data?.skus.porcentajeCrecimiento || 0,
      color: 'blue',
    },
    {
      label: 'Órdenes',
      mesActual: data?.ordenes.mesActual || 0,
      mesAnterior: data?.ordenes.mesAnterior || 0,
      porcentaje: data?.ordenes.porcentajeCrecimiento || 0,
      color: 'green',
    },
    {
      label: 'Modelos',
      mesActual: data?.modelos.mesActual || 0,
      mesAnterior: data?.modelos.mesAnterior || 0,
      porcentaje: data?.modelos.porcentajeCrecimiento || 0,
      color: 'purple',
    },
  ];

  const getTrendIcon = (porcentaje: number) => {
    if (porcentaje > 0) return <TrendingUp className="text-green-500" size={20} />;
    if (porcentaje < 0) return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-500" size={20} />;
  };

  const getTrendColor = (porcentaje: number) => {
    if (porcentaje > 0) return 'text-green-600';
    if (porcentaje < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const colorClasses = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Crecimiento Mensual
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicators.map((indicator) => (
          <div
            key={indicator.label}
            className={`border-l-4 ${
              colorClasses[indicator.color as keyof typeof colorClasses]
            } bg-gray-50 p-4 rounded-r-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">{indicator.label}</p>
              {getTrendIcon(indicator.porcentaje)}
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {indicator.mesActual}
              </p>
              <p className={`text-lg font-semibold ${getTrendColor(indicator.porcentaje)}`}>
                {indicator.porcentaje > 0 ? '+' : ''}
                {indicator.porcentaje}%
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mes anterior: {indicator.mesAnterior}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};