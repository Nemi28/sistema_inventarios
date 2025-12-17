import { Laptop, Building2, Home } from 'lucide-react';
import { useLaptopsPorPropiedad } from '../hooks/useDashboard';
import { useDashboardFiltros } from '../context/DashboardContext';

export const LaptopsPropiedadCards = () => {
  const { filtros } = useDashboardFiltros();
  const { data, isLoading } = useLaptopsPorPropiedad(filtros);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const propias = data?.propias || { total: 0, en_almacen: 0, en_tiendas: 0, en_personas: 0 };
  const alquiladas = data?.alquiladas || { total: 0, en_almacen: 0, en_tiendas: 0, en_personas: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Laptops Propias */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Laptop size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Laptops Propias</h3>
              <p className="text-emerald-100 text-sm">Equipos de la empresa</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{propias.total}</p>
            <p className="text-emerald-100 text-sm">Total</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-semibold">{propias.en_almacen}</p>
            <p className="text-xs text-emerald-100">Almacén</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{propias.en_tiendas}</p>
            <p className="text-xs text-emerald-100">Tiendas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{propias.en_personas}</p>
            <p className="text-xs text-emerald-100">Personas</p>
          </div>
        </div>
      </div>

      {/* Laptops Alquiladas */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Laptops Alquiladas</h3>
              <p className="text-amber-100 text-sm">Equipos en alquiler</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{alquiladas.total}</p>
            <p className="text-amber-100 text-sm">Total</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-semibold">{alquiladas.en_almacen}</p>
            <p className="text-xs text-amber-100">Almacén</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{alquiladas.en_tiendas}</p>
            <p className="text-xs text-amber-100">Tiendas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{alquiladas.en_personas}</p>
            <p className="text-xs text-amber-100">Personas</p>
          </div>
        </div>
      </div>
    </div>
  );
};