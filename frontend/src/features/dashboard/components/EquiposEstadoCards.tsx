import { CheckCircle, HelpCircle, Shield, XCircle, Trash2 } from 'lucide-react';
import { useEquiposPorEstado } from '../hooks/useDashboard';

export const EquiposEstadoCards = () => {
  const { data, isLoading } = useEquiposPorEstado();

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
      label: 'Operativos',
      value: data?.operativo || 0,
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
    },
    {
      label: 'Por Validar',
      value: data?.por_validar || 0,
      icon: HelpCircle,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-700',
      valueColor: 'text-amber-900',
    },
    {
      label: 'En Garantía',
      value: data?.en_garantia || 0,
      icon: Shield,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-900',
    },
    {
      label: 'Inoperativos',
      value: data?.inoperativo || 0,
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-700',
      valueColor: 'text-red-900',
    },
    {
      label: 'Baja',
      value: data?.baja || 0,
      icon: Trash2,
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-200',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-600',
      valueColor: 'text-gray-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-xl shadow-sm border p-5 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-medium ${card.textColor}`}>{card.label}</p>
              <div className={`p-2 ${card.iconBg} rounded-lg`}>
                <Icon size={18} className={card.iconColor} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.valueColor}`}>
              {card.value.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
};