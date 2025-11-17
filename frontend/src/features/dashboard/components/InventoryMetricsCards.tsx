import { Package, Tag, Layers, TrendingUp, Store } from 'lucide-react';
import { useMetricasInventario } from '../hooks/useDashboardStats';

export const InventoryMetricsCards = () => {
  const { data, isLoading } = useMetricasInventario();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Modelos',
      total: data?.modelos.total || 0,
      activos: data?.modelos.activos || 0,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Marcas',
      total: data?.marcas.total || 0,
      activos: data?.marcas.activos || 0,
      icon: Tag,
      color: 'indigo',
    },
    {
      label: 'Subcategorías',
      total: data?.subcategorias.total || 0,
      activos: data?.subcategorias.activos || 0,
      icon: Layers,
      color: 'violet',
    },
    {
      label: 'Prom. Modelos/Marca',
      value: data?.promedioModelosPorMarca || 0,
      icon: TrendingUp,
      color: 'cyan',
      isAverage: true,
    },
    {
      label: 'Prom. Tiendas/Socio',
      value: data?.promedioTiendasPorSocio || 0,
      icon: Store,
      color: 'teal',
      isAverage: true,
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    violet: 'bg-violet-100 text-violet-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                {metric.isAverage ? (
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metric.value}
                  </p>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {metric.activos}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {metric.total}
                    </p>
                  </>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  colorClasses[metric.color as keyof typeof colorClasses]
                }`}
              >
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};