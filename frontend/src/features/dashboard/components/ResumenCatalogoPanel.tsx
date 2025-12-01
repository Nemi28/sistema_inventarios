import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, Store, Users, Tag, Layers, FolderOpen, ShoppingCart } from 'lucide-react';
import { useResumenCatalogo } from '../hooks/useDashboard';

export const ResumenCatalogoPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useResumenCatalogo();

  const items = [
    { label: 'SKUs', value: data?.skus.activos || 0, total: data?.skus.total || 0, icon: Package, color: 'blue' },
    { label: 'Modelos', value: data?.modelos.activos || 0, total: data?.modelos.total || 0, icon: Layers, color: 'indigo' },
    { label: 'Marcas', value: data?.marcas.activos || 0, total: data?.marcas.total || 0, icon: Tag, color: 'violet' },
    { label: 'Categorías', value: data?.categorias.activos || 0, total: data?.categorias.total || 0, icon: FolderOpen, color: 'pink' },
    { label: 'Tiendas', value: data?.tiendas.activos || 0, total: data?.tiendas.total || 0, icon: Store, color: 'emerald' },
    { label: 'Socios', value: data?.socios.activos || 0, total: data?.socios.total || 0, icon: Users, color: 'amber' },
    { label: 'Órdenes', value: data?.ordenes.activos || 0, total: data?.ordenes.total || 0, icon: ShoppingCart, color: 'cyan' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    pink: 'bg-pink-50 text-pink-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="text-gray-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">Resumen del Catálogo</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Datos maestros del sistema</span>
          {isOpen ? (
            <ChevronUp className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t bg-gray-50">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="bg-white rounded-lg p-4 border shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${colorClasses[item.color]}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{item.label}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">de {item.total} totales</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};