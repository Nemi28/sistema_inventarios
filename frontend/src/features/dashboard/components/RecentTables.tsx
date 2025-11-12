import { Package, Store, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { useUltimosSKUs, useUltimasTiendas, useUltimasOrdenes } from '../hooks/useDashboardStats';

export const RecentTables = () => {
  const { data: skusData, isLoading: skusLoading } = useUltimosSKUs();
  const { data: tiendasData, isLoading: tiendasLoading } = useUltimasTiendas();
  const { data: ordenesData, isLoading: ordenesLoading } = useUltimasOrdenes();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (skusLoading || tiendasLoading || ordenesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Registros Recientes</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos SKUs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              <h4 className="text-lg font-semibold text-gray-800">Últimos SKUs</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {(skusData || []).map((sku, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{sku.codigo_sku}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{sku.descripcion_sku}</p>
                    </div>
                    {sku.activo ? (
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    ) : (
                      <XCircle className="text-red-500 flex-shrink-0" size={16} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(sku.fecha_creacion)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Últimas Tiendas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Store className="text-green-600" size={20} />
              <h4 className="text-lg font-semibold text-gray-800">Últimas Tiendas</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {(tiendasData || []).map((tienda, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {tienda.pdv}
                        </span>
                        {tienda.activo ? (
                          <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                        ) : (
                          <XCircle className="text-red-500 flex-shrink-0" size={16} />
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm mt-1">{tienda.nombre_tienda}</p>
                      <p className="text-xs text-gray-600 mt-1">{tienda.socio}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(tienda.fecha_creacion)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Últimas Órdenes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-orange-600" size={20} />
              <h4 className="text-lg font-semibold text-gray-800">Últimas Órdenes</h4>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {(ordenesData || []).map((orden, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{orden.numero_orden}</p>
                      {orden.detalle && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{orden.detalle}</p>
                      )}
                    </div>
                    {orden.activo ? (
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    ) : (
                      <XCircle className="text-red-500 flex-shrink-0" size={16} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Ingreso: {formatDate(orden.fecha_ingreso)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};