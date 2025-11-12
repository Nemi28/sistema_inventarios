import { Package, Store, Users, ShoppingCart, FolderOpen } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const StatsCards = () => {
  const { data, isLoading } = useDashboardStats();

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

  const stats = [
    {
      label: 'SKUs',
      total: data?.skus.total || 0,
      activos: data?.skus.activos || 0,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Tiendas',
      total: data?.tiendas.total || 0,
      activos: data?.tiendas.activos || 0,
      icon: Store,
      color: 'green',
    },
    {
      label: 'Socios',
      total: data?.socios.total || 0,
      activos: data?.socios.activos || 0,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Órdenes',
      total: data?.ordenes.total || 0,
      activos: data?.ordenes.activos || 0,
      icon: ShoppingCart,
      color: 'orange',
    },
    {
      label: 'Categorías',
      total: data?.categorias.total || 0,
      activos: data?.categorias.activos || 0,
      icon: FolderOpen,
      color: 'pink',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.activos}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {stat.total}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  colorClasses[stat.color as keyof typeof colorClasses]
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