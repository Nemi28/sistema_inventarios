import { Clock, Truck, AlertTriangle, CheckCircle, Store } from 'lucide-react';
import { useUltimosMovimientos, useEquiposEnTransito, useTopTiendasEquipos } from '../hooks/useDashboard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const estadoBadge: Record<string, { bg: string; text: string; icon: any }> = {
  COMPLETADO: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  EN_TRANSITO: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Truck },
  PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  CANCELADO: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
};

export const DashboardTables = () => {
  const { data: movimientos, isLoading: movLoading } = useUltimosMovimientos();
  const { data: enTransito, isLoading: transitoLoading } = useEquiposEnTransito();
  const { data: topTiendas, isLoading: tiendasLoading } = useTopTiendasEquipos();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatDestino = (mov: any) => {
    if (mov.ubicacion_destino === 'TIENDA' && mov.tienda_destino) {
      return mov.tienda_destino;
    }
    if (mov.ubicacion_destino === 'PERSONA' && mov.persona_destino) {
      return mov.persona_destino;
    }
    if (mov.ubicacion_destino === 'ALMACEN') {
      return 'Almacén';
    }
    return mov.ubicacion_destino;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos Movimientos */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Clock className="text-indigo-600" size={20} />
              <h4 className="text-lg font-semibold text-gray-800">Últimos Movimientos</h4>
            </div>
          </div>
          <div className="overflow-x-auto">
            {movLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Equipo</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Destino</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(movimientos || []).map((mov) => {
                    const estado = estadoBadge[mov.estado_movimiento] || estadoBadge.PENDIENTE;
                    const EstadoIcon = estado.icon;
                    
                    return (
                      <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{mov.modelo}</p>
                            <p className="text-xs text-gray-500">{mov.numero_serie || mov.inv_entel || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{mov.tipo_label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{formatDestino(mov)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estado.bg} ${estado.text}`}>
                            <EstadoIcon size={12} />
                            {mov.estado_movimiento.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{formatDate(mov.fecha_salida)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Tiendas */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Store className="text-orange-600" size={20} />
              <h4 className="text-lg font-semibold text-gray-800">Top Tiendas</h4>
            </div>
          </div>
          <div className="p-4">
            {tiendasLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(topTiendas || []).map((tienda, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tienda.tienda}</p>
                        <p className="text-xs text-gray-500">{tienda.socio}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{tienda.cantidad_equipos}</p>
                      <p className="text-xs text-gray-500">equipos</p>
                    </div>
                  </div>
                ))}
                {(!topTiendas || topTiendas.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No hay tiendas con equipos</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Equipos En Tránsito */}
      {(enTransito && enTransito.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b bg-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="text-red-600" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Equipos En Tránsito</h4>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {enTransito.length} equipos
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Equipo</th>
                  <th className="px-4 py-3 text-left">Origen</th>
                  <th className="px-4 py-3 text-left">Destino</th>
                  <th className="px-4 py-3 text-left">Fecha Salida</th>
                  <th className="px-4 py-3 text-left">Días</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enTransito.map((equipo) => (
                  <tr key={equipo.movimiento_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{equipo.modelo}</p>
                        <p className="text-xs text-gray-500">{equipo.numero_serie || equipo.inv_entel || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {equipo.tienda_origen || equipo.ubicacion_origen}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {equipo.tienda_destino || equipo.persona_destino || equipo.ubicacion_destino}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{formatDate(equipo.fecha_salida)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        equipo.dias_en_transito > 7 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {equipo.dias_en_transito} días
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
