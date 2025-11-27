import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { SearchBar } from '@/components/common/SearchBar';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { useMovimientos } from '../hooks/useMovimientos';
import { columnsMovimientos } from './columns';
import { MovimientoCard } from './MovimientoCard';
import { ActualizarEstadoModal } from './ActualizarEstadoModal';
import { Movimiento } from '../types';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const MovimientosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  
  // Debounce para búsqueda
  const debouncedSearch = useDebounce(searchTerm, 400);
  
  // Modal de detalle
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Movimiento | null>(null);
  
  // Modal de confirmar recepción
  const [movimientoParaConfirmar, setMovimientoParaConfirmar] = useState<Movimiento | null>(null);

  const { data, isLoading } = useMovimientos({
    page,
    limit: 20,
    busqueda: debouncedSearch || undefined, // ← Conectar búsqueda
    ordenar_por: 'em.fecha_salida',
    orden: 'DESC',
  });

  // Reset página cuando cambia la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value !== searchTerm) {
      setPage(1);
    }
  };

  // Handler para ver detalle
  const handleView = (movimiento: Movimiento) => {
    setMovimientoSeleccionado(movimiento);
  };

  // Handler para confirmar recepción
  const handleConfirmarRecepcion = (movimiento: Movimiento) => {
    setMovimientoParaConfirmar(movimiento);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Movimientos</h1>
            <p className="text-gray-500 mt-1">
              {data?.paginacion.total || 0} movimientos registrados
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex-1">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por equipo, serie, acta, ticket, tienda, persona..."
          isLoading={isLoading && !!debouncedSearch}
        />
      </div>

      {/* Tabla */}
      <DataTable
        data={data?.data || []}
        columns={columnsMovimientos}
        isLoading={isLoading}
        meta={{
          onView: handleView,
          onConfirmarRecepcion: handleConfirmarRecepcion,
        }}
      />

      {/* Paginación */}
      {data?.paginacion && data.paginacion.total_paginas > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.paginacion.total_paginas}
          onPageChange={setPage}
          totalItems={data.paginacion.total}
          itemsPerPage={data.paginacion.registros_por_pagina}
        />
      )}

      {/* Modal de detalle */}
      <Dialog
        open={!!movimientoSeleccionado}
        onOpenChange={(open) => !open && setMovimientoSeleccionado(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Movimiento</DialogTitle>
          </DialogHeader>
          {movimientoSeleccionado && <MovimientoCard movimiento={movimientoSeleccionado} />}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmar Recepción */}
      <ActualizarEstadoModal
        open={!!movimientoParaConfirmar}
        onClose={() => setMovimientoParaConfirmar(null)}
        movimiento={movimientoParaConfirmar}
      />
    </div>
  );
};