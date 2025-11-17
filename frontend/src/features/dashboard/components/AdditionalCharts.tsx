import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  useTopCategorias,
  useTopMarcas,
  useDistribucionEquipos,
} from '../hooks/useDashboardStats';
import { useState } from 'react';

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#14B8A6',
];

export const AdditionalCharts = () => {
  const [topLimit, setTopLimit] = useState<5 | 10>(10);

  const { data: topCategoriasData, isLoading: categoriasLoading } =
    useTopCategorias(topLimit);
  const { data: topMarcasData, isLoading: marcasLoading } = useTopMarcas(topLimit);
  const { data: distribucionData, isLoading: distribucionLoading } =
    useDistribucionEquipos();


  if (categoriasLoading || marcasLoading || distribucionLoading) {
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
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Análisis de Catálogo
        </h3>

        {/* Filtro de Top */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar Top:</span>
          <select
            value={topLimit}
            onChange={(e) => setTopLimit(Number(e.target.value) as 5 | 10)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categorías por Modelos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Top Categorías por Modelos
            <span className="text-sm text-gray-500 ml-2">
      (Mostrando: {topCategoriasData?.length || 0} de {topLimit})
    </span>
          </h4>
          <ResponsiveContainer 
          width="100%" 
          height={Math.max(300, (topCategoriasData?.length || 0) * 40)}
          key={`categorias-${topLimit}`}
          >
            <BarChart
              data={topCategoriasData || []}
              layout="vertical"
              margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="categoria" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} modelos (${props.payload.porcentaje}%)`,
                  'Cantidad',
                ]}
              />
              <Legend />
              <Bar
                dataKey="cantidad_modelos"
                fill="#3B82F6"
                name="Modelos"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de Equipos - Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Distribución de Equipos por Categoría
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              
              <Pie
                data={distribucionData as any || []}
                dataKey="cantidad"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                label={false}
                >
              
                {(distribucionData || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} modelos (${props.payload.porcentaje}%)`,
                  props.payload.categoria,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Leyenda manual para evitar superposición */}
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {(distribucionData || []).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-700 truncate">
                          {item.categoria}: <strong>{item.porcentaje}%</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
        </div>
      </div>

      {/* Top Marcas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Top Marcas del Catálogo
          <span className="text-sm text-gray-500 ml-2">
      (Mostrando: {topMarcasData?.length || 0} de {topLimit})
    </span>
        </h4>
        <ResponsiveContainer width="100%" height={300} key={`marcas-${topLimit}`}>
          <BarChart data={topMarcasData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="marca" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="cantidad_modelos"
              fill="#3B82F6"
              name="Modelos"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="categorias_cubiertas"
              fill="#10B981"
              name="Categorías"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};