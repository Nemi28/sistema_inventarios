import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useSkusPorMes, useOrdenesPorMes, useTiendasPorSocio, useModelosPorMes } from '../hooks/useDashboardStats';
import { useState } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const ChartsSection = () => {
  const [periodo, setPeriodo] = useState<3 | 6 | 12>(6);
  
  const { data: skusData, isLoading: skusLoading } = useSkusPorMes(periodo);
  const { data: ordenesData, isLoading: ordenesLoading } = useOrdenesPorMes(periodo);
  const { data: modelosData, isLoading: modelosLoading } = useModelosPorMes(periodo);
  const { data: tiendasData, isLoading: tiendasLoading } = useTiendasPorSocio();

  if (skusLoading || ordenesLoading || tiendasLoading || modelosLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
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
        <h3 className="text-xl font-bold text-gray-900">Análisis y Tendencias</h3>
        
        {/* Filtro de período */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Período:</span>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value) as 3 | 6 | 12)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico combinado: SKUs, Órdenes y Modelos */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Evolución Temporal</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes_nombre" allowDuplicatedCategory={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                data={skusData || []} 
                type="monotone" 
                dataKey="cantidad" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="SKUs" 
                dot={{ r: 4 }}
              />
              <Line 
                data={ordenesData || []} 
                type="monotone" 
                dataKey="cantidad" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Órdenes" 
                dot={{ r: 4 }}
              />
              <Line 
                data={modelosData || []} 
                type="monotone" 
                dataKey="cantidad" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Modelos" 
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

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