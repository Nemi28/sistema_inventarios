import React from 'react';
import { Warehouse, Store, UserCheck, Truck, Package } from 'lucide-react';
import { useEquiposPorUbicacion } from '../hooks/useDashboard';

export const EquiposUbicacionCards = () => {
  const { data, isLoading } = useEquiposPorUbicacion();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Equipos',
      value: data?.total || 0,
      icon: Package,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
    },
    {
      label: 'En Almacén',
      value: data?.en_almacen || 0,
      icon: Warehouse,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-white',
    },
    {
      label: 'En Tiendas',
      value: data?.en_tiendas || 0,
      icon: Store,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-white',
    },
    {
      label: 'En Personas',
      value: data?.en_personas || 0,
      icon: UserCheck,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
    },
    {
      label: 'En Tránsito',
      value: data?.en_transito || 0,
      icon: Truck,
      bgColor: data?.en_transito && data.en_transito > 0 
        ? 'bg-gradient-to-br from-red-500 to-red-600' 
        : 'bg-gradient-to-br from-gray-400 to-gray-500',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-xl shadow-lg p-5 ${card.textColor} transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">{card.label}</p>
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
};