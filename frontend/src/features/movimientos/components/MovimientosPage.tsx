import { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, X } from 'lucide-react';
import { SearchBar } from '@/components/common/SearchBar';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMovimientos } from '../hooks/useMovimientos';
import { columnsMovimientos } from './columns';
import { MovimientoCard } from './MovimientoCard';
import { ActualizarEstadoModal } from './ActualizarEstadoModal';
import { EditarMovimientoModal } from './EditarMovimientoModal';
import { Movimiento } from '../types';
import { useDebounce } from '@/hooks/useDebounce';
import { exportarMovimientosExcel } from '../services/movimientos.service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const MovimientosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [estadoMovimiento, setEstadoMovimiento] = useState('');
  
  // Debounce para búsqueda
  const debouncedSearch = useDebounce(searchTerm, 400);
  
  // Modal de detalle
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Movimiento | null>(null);
  
  // Modal de confirmar recepción
  const [movimientoParaConfirmar, setMovimientoParaConfirmar] = useState<Movimiento | null>(null);

  // Modal de edición
  const [movimientoParaEditar, setMovimientoParaEditar] = useState<Movimiento | null>(null);

  const { data, isLoading, refetch } = useMovimientos({
    page,
    limit: 20,
    busqueda: debouncedSearch || undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    estado_movimiento: estadoMovimiento || undefined,
    ordenar_por: 'em.fecha_salida',
    orden: 'DESC',
  });

  // Reset página cuando cambian filtros
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, fechaDesde, fechaHasta, estadoMovimiento]);

  // Handler para búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handler para limpiar filtros
  const handleLimpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setEstadoMovimiento('');
  };

  const hayFiltros = fechaDesde || fechaHasta || estadoMovimiento;

  // Handler para ver detalle
  const handleView = (movimiento: Movimiento) => {
    setMovimientoSeleccionado(movimiento);
  };

  // Handler para editar
  const handleEdit = (movimiento: Movimiento) => {
    setMovimientoParaEditar(movimiento);
  };

  // Handler para cerrar edición
  const handleCloseEdit = () => {
    setMovimientoParaEditar(null);
    refetch();
  };

  // Handler para confirmar recepción
  const handleConfirmarRecepcion = (movimiento: Movimiento) => {
    setMovimientoParaConfirmar(movimiento);
  };

  // Handler para cerrar confirmación
  const handleCloseConfirmar = () => {
    setMovimientoParaConfirmar(null);
    refetch();
  };

  // Handler para exportar Excel
  const handleExportarExcel = async () => {
    try {
      setIsExporting(true);
      await exportarMovimientosExcel({
        busqueda: debouncedSearch || undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        estado_movimiento: estadoMovimiento || undefined,
      });
      toast.success('Archivo Excel descargado correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar los movimientos');
    } finally {
      setIsExporting(false);
    }
  };

  const hayFiltrosFecha = fechaDesde || fechaHasta;

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

        {/* Botón Exportar */}
        <Button
          variant="outline"
          onClick={handleExportarExcel}
          disabled={isExporting || isLoading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por equipo, serie, acta, ticket, tienda, persona..."
            isLoading={isLoading && !!debouncedSearch}
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Estado */}
          <Select value={estadoMovimiento} onValueChange={setEstadoMovimiento}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
              <SelectItem value="COMPLETADO">Completado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          {/* Fechas */}
          <div className="flex items-center gap-1 bg-gray-50 border rounded-md px-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-32 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
              title="Fecha desde"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-32 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
              title="Fecha hasta"
            />
          </div>

          {/* Limpiar filtros */}
          {hayFiltros && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLimpiarFiltros}
              className="h-9 w-9 text-gray-400 hover:text-gray-600"
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        data={data?.data || []}
        columns={columnsMovimientos}
        isLoading={isLoading}
        meta={{
          onView: handleView,
          onEdit: handleEdit,
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
        onClose={handleCloseConfirmar}
        movimiento={movimientoParaConfirmar}
      />

      {/* Modal de Edición */}
      <EditarMovimientoModal
        open={!!movimientoParaEditar}
        onClose={handleCloseEdit}
        movimiento={movimientoParaEditar}
      />
    </div>
  );
};