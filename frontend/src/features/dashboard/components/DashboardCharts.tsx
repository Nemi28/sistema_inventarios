import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  useMovimientosPorMes,
  useDistribucionUbicacion,
  useMovimientosPorTipo,
  useEquiposPorCategoria,
  useTiendasPorSocio,
} from '../hooks/useDashboard';

const COLORS_UBICACION = {
  ALMACEN: '#10B981',
  TIENDA: '#F59E0B',
  PERSONA: '#8B5CF6',
  EN_TRANSITO: '#EF4444',
};

const COLORS_CATEGORIA = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const UBICACION_LABELS: Record<string, string> = {
  ALMACEN: 'Almacén',
  TIENDA: 'Tiendas',
  PERSONA: 'Personas',
  EN_TRANSITO: 'En Tránsito',
};

export const DashboardCharts = () => {
  const [periodo, setPeriodo] = useState<number>(6);

  const { data: movMesData, isLoading: movMesLoading } = useMovimientosPorMes(periodo);
  const { data: distribData, isLoading: distribLoading } = useDistribucionUbicacion();
  const { data: movTipoData, isLoading: movTipoLoading } = useMovimientosPorTipo();
  const { data: equipoCatData, isLoading: equipoCatLoading } = useEquiposPorCategoria();
  const { data: tiendasSocioData, isLoading: tiendasSocioLoading } = useTiendasPorSocio();

  const isLoading = movMesLoading || distribLoading || movTipoLoading || equipoCatLoading || tiendasSocioLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtro */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Análisis y Tendencias</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Período:</span>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movimientos por Mes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Movimientos por Mes
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={movMesData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="mes_nombre" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="cantidad" 
                fill="#3B82F6" 
                radius={[6, 6, 0, 0]}
                name="Movimientos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Ubicación */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Distribución por Ubicación
          </h4>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={280}>
              <PieChart>
                <Pie
                  data={(distribData || []) as any[]}
                  dataKey="cantidad"
                  nameKey="ubicacion"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {(distribData || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS_UBICACION[entry.ubicacion as keyof typeof COLORS_UBICACION] || '#6B7280'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} equipos`,
                    UBICACION_LABELS[name] || name
                  ]}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #E5E7EB' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {(distribData || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: COLORS_UBICACION[item.ubicacion as keyof typeof COLORS_UBICACION] || '#6B7280' 
                      }}
                    />
                    <span className="text-sm text-gray-700">
                      {UBICACION_LABELS[item.ubicacion] || item.ubicacion}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{item.cantidad}</span>
                    <span className="text-xs text-gray-500 ml-1">({item.porcentaje}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Movimientos por Tipo */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Movimientos por Tipo
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={movTipoData || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="tipo_label" 
                type="category" 
                width={110}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #E5E7EB' 
                }}
              />
              <Bar 
                dataKey="cantidad" 
                fill="#8B5CF6" 
                radius={[0, 6, 6, 0]}
                name="Cantidad"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Equipos por Categoría */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Equipos por Categoría
          </h4>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={280}>
              <PieChart>
                <Pie
                  data={(equipoCatData || []) as any[]}
                  dataKey="cantidad"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {(equipoCatData || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS_CATEGORIA[index % COLORS_CATEGORIA.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} equipos`, 'Cantidad']}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #E5E7EB' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 max-h-[280px] overflow-y-auto">
              {(equipoCatData || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS_CATEGORIA[index % COLORS_CATEGORIA.length] }}
                    />
                    <span className="text-sm text-gray-700 truncate">{item.categoria}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-900">{item.cantidad}</span>
                    <span className="text-xs text-gray-500 ml-1">({item.porcentaje}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tiendas por Socio - Ancho completo */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Tiendas por Socio
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={(tiendasSocioData || []) as any[]}
                dataKey="cantidad"
                nameKey="socio"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ value }) => value}
              >
                {(tiendasSocioData || []).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS_CATEGORIA[index % COLORS_CATEGORIA.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} tiendas`, name]}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #E5E7EB' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex flex-col justify-center">
            <h5 className="font-semibold text-gray-700 mb-3">Detalle por Socio</h5>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {(tiendasSocioData || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS_CATEGORIA[index % COLORS_CATEGORIA.length] }}
                    />
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