import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useTiendasActivas } from '@/features/tiendas/hooks/useTiendasActivas';
import { cn } from '@/lib/utils';

interface TiendaSelectProps {
  value: number;
  onChange: (value: number) => void;
}

export const TiendaSelect: React.FC<TiendaSelectProps> = ({ value, onChange }) => {
  const { data: tiendas = [], isLoading } = useTiendasActivas();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const tiendaSeleccionada = tiendas.find((t) => t.id === value);

  const tiendasFiltradas = tiendas.filter(
    (tienda) =>
      tienda.nombre_tienda.toLowerCase().includes(search.toLowerCase()) ||
      tienda.pdv.toLowerCase().includes(search.toLowerCase()) ||
      tienda.direccion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
        disabled={isLoading}
      >
        <span className={cn('truncate', !value && 'text-gray-400')}>
          {value && tiendaSeleccionada
            ? `${tiendaSeleccionada.pdv} - ${tiendaSeleccionada.nombre_tienda}`
            : 'Buscar tienda...'}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Buscar por nombre o PDV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-48">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Cargando tiendas...
              </div>
            ) : tiendasFiltradas.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                No se encontraron tiendas
              </div>
            ) : (
              tiendasFiltradas.map((tienda) => (
                <button
                  key={tienda.id}
                  type="button"
                  onClick={() => {
                    onChange(tienda.id);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      'h-4 w-4',
                      value === tienda.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">
                      {tienda.pdv} - {tienda.nombre_tienda}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {tienda.direccion}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar al hacer clic fuera */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setSearch('');
          }}
        />
      )}
    </div>
  );
};