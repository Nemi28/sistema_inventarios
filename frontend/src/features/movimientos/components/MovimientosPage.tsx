import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { SearchBar } from '@/components/common/SearchBar';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { useMovimientos } from '../hooks/useMovimientos';
import { columnsMovimientos } from './columns';
import { MovimientoCard } from './MovimientoCard';
import { Movimiento } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const MovimientosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Movimiento | null>(null);

  const { data, isLoading } = useMovimientos({
    page,
    limit: 20,
    ordenar_por: 'em.fecha_salida',
    orden: 'DESC',
  });

  const handleView = (movimiento: Movimiento) => {
    setMovimientoSeleccionado(movimiento);
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
          onChange={setSearchTerm}
          placeholder="Buscar por equipo, acta, ticket..."
          isLoading={false}
        />
      </div>

      {/* Tabla */}
      <DataTable
        data={data?.data || []}
        columns={columnsMovimientos}
        isLoading={isLoading}
        meta={{
          onView: handleView,  // ← CORRECTO: Dentro de meta
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
    </div>
  );
};