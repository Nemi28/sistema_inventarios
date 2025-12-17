import { Filter, X } from 'lucide-react';
import { useSociosLista, useSubcategoriasLista } from '../hooks/useDashboard';
import { useDashboardFiltros } from '../context/DashboardContext';

export const DashboardFilters = () => {
  const { filtros, setSocioId, setSubcategoriaId, limpiarFiltros } = useDashboardFiltros();
  const { data: socios, isLoading: sociosLoading } = useSociosLista();
  const { data: subcategorias, isLoading: subcategoriasLoading } = useSubcategoriasLista();

  const hayFiltrosActivos = filtros.socio_id || filtros.subcategoria_id;

  // Agrupar subcategorías por categoría
  const subcategoriasAgrupadas = subcategorias?.reduce((acc, sc) => {
    if (!acc[sc.categoria]) {
      acc[sc.categoria] = [];
    }
    acc[sc.categoria].push(sc);
    return acc;
  }, {} as Record<string, typeof subcategorias>);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter size={18} />
          <span className="font-medium text-sm">Filtros:</span>
        </div>

        {/* Filtro por Socio */}
        <div className="flex-1 min-w-[200px] max-w-[280px]">
          <select
            value={filtros.socio_id || ''}
            onChange={(e) => setSocioId(e.target.value ? Number(e.target.value) : undefined)}
            disabled={sociosLoading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Todos los socios</option>
            {socios?.map((socio) => (
              <option key={socio.id} value={socio.id}>
                {socio.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Subcategoría (Tipo de Equipo) */}
        <div className="flex-1 min-w-[200px] max-w-[280px]">
          <select
            value={filtros.subcategoria_id || ''}
            onChange={(e) => setSubcategoriaId(e.target.value ? Number(e.target.value) : undefined)}
            disabled={subcategoriasLoading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Todos los tipos de equipo</option>
            {subcategoriasAgrupadas && Object.entries(subcategoriasAgrupadas).map(([categoria, items]) => (
              <optgroup key={categoria} label={categoria}>
                {items?.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Botón Limpiar */}
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {hayFiltrosActivos && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtros activos:</span>
          {filtros.socio_id && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Socio: {socios?.find((s) => s.id === filtros.socio_id)?.nombre}
            </span>
          )}
          {filtros.subcategoria_id && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
              Tipo: {subcategorias?.find((s) => s.id === filtros.subcategoria_id)?.nombre}
            </span>
          )}
        </div>
      )}
    </div>
  );
};