import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSkusPorMes, useOrdenesPorMes, useTiendasPorSocio } from '../hooks/useDashboardStats';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const ChartsSection = () => {
  const { data: skusData, isLoading: skusLoading } = useSkusPorMes();
  const { data: ordenesData, isLoading: ordenesLoading } = useOrdenesPorMes();
  const { data: tiendasData, isLoading: tiendasLoading } = useTiendasPorSocio();

  if (skusLoading || ordenesLoading || tiendasLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Análisis y Tendencias</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de SKUs por mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">SKUs Creados por Mes</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skusData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes_nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#3B82F6" name="SKUs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Órdenes por mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Órdenes de Compra por Mes</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordenesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes_nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#10B981" name="Órdenes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Tiendas por Socio */}
<div className="bg-white rounded-lg shadow p-6">
  <h4 className="text-lg font-semibold text-gray-800 mb-4">Tiendas por Socio</h4>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={tiendasData as any || []}
          dataKey="cantidad"
          nameKey="socio"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {(tiendasData || []).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    
    <div className="flex flex-col justify-center">
      <h5 className="font-semibold text-gray-700 mb-3">Detalle por Socio</h5>
      <div className="space-y-2">
        {(tiendasData || []).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-sm text-gray-700">{item.socio}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.cantidad}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

    </div>
  );
};