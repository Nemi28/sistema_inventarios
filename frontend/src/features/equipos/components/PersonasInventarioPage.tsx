import { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { SearchBar } from '@/components/common/SearchBar';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EquipoFiltersCascade } from './EquipoFiltersCascade';
import { MovimientoModal } from '@/features/movimientos/components/MovimientoModal';
import { RetornarAlmacenModal } from '@/features/movimientos/components/RetornarAlmacenModal';
import { HistorialModal } from '@/features/movimientos/components/HistorialModal';
import { EquipoDetalleModal } from './EquipoDetalleModal';
import { useEquiposPersonas } from '../hooks/useEquiposPersonas';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDebounce } from '@/hooks/useDebounce';
import { columnsPersonas } from './columnsPersonas';
import { Equipo } from '../types';
import { RowSelectionState } from '@tanstack/react-table';

export const PersonasInventarioPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  
  // Debounce para búsqueda
  const debouncedSearch = useDebounce(searchTerm, 400);
  
  // Filtros en cascada
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [subcategoriaId, setSubcategoriaId] = useState<number | undefined>();
  const [marcaId, setMarcaId] = useState<number | undefined>();
  const [modeloId, setModeloId] = useState<number | undefined>();

  // Selección múltiple PERSISTENTE por ID
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedEquiposIds, setSelectedEquiposIds] = useState<Set<number>>(new Set());

  // Modal de movimiento
  const { 
    isOpen: isMovimientoOpen, 
    open: openMovimiento, 
    close: closeMovimiento 
  } = useDisclosure();

  // Modal de retornar a almacén
  const [equipoParaRetornar, setEquipoParaRetornar] = useState<Equipo | null>(null);

  // Modal de historial
  const [equipoParaHistorial, setEquipoParaHistorial] = useState<Equipo | null>(null);

  // Modal de detalle
  const [equipoParaDetalle, setEquipoParaDetalle] = useState<Equipo | null>(null);

  const { data, isLoading, refetch } = useEquiposPersonas({
    page,
    limit: 20,
    categoria_id: categoriaId,
    subcategoria_id: subcategoriaId,
    marca_id: marcaId,
    modelo_id: modeloId,
    busqueda: debouncedSearch || undefined,
    ordenar_por: 'mov_actual.fecha_salida',
    orden: 'DESC',
  });

  // Reset página cuando cambian filtros o búsqueda
  useEffect(() => {
    setPage(1);
  }, [categoriaId, subcategoriaId, marcaId, modeloId, debouncedSearch]);

  // Sincronizar rowSelection con selectedEquiposIds
  useEffect(() => {
    if (data?.data) {
      const newRowSelection: RowSelectionState = {};
      data.data.forEach((equipo) => {
        if (selectedEquiposIds.has(equipo.id)) {
          newRowSelection[equipo.id.toString()] = true;
        }
      });
      setRowSelection(newRowSelection);
    }
  }, [data, selectedEquiposIds]);

  const handleResetFilters = () => {
    setCategoriaId(undefined);
    setSubcategoriaId(undefined);
    setMarcaId(undefined);
    setModeloId(undefined);
    setPage(1);
  };

  const handleView = (equipo: Equipo) => {
    setEquipoParaDetalle(equipo);
  };

  const handleViewHistory = (equipo: Equipo) => {
    setEquipoParaHistorial(equipo);
  };

  // Handler para retornar a almacén
  const handleRetornarAlmacen = (equipo: Equipo) => {
    setEquipoParaRetornar(equipo);
  };

  // Manejar cambios en la selección
  const handleRowSelectionChange = (updaterOrValue: any) => {
    setRowSelection((old) => {
      const newSelection = typeof updaterOrValue === 'function' 
        ? updaterOrValue(old) 
        : updaterOrValue;

      // Actualizar Set de IDs seleccionados
      const newIds = new Set(selectedEquiposIds);
      
      // Agregar o quitar IDs según la nueva selección
      Object.keys(newSelection).forEach((id) => {
        const equipoId = parseInt(id);
        if (newSelection[id]) {
          newIds.add(equipoId);
        } else {
          newIds.delete(equipoId);
        }
      });

      setSelectedEquiposIds(newIds);
      return newSelection;
    });
  };

  // Obtener equipos seleccionados
  const selectedEquipos = useMemo(() => {
    return (data?.data || []).filter((equipo) => selectedEquiposIds.has(equipo.id));
  }, [data, selectedEquiposIds]);

  const selectedCount = selectedEquiposIds.size;

  const handleMovimientoClose = () => {
    closeMovimiento();
    setRowSelection({});
    setSelectedEquiposIds(new Set());
    refetch();
  };

  const handleRetornarClose = () => {
    setEquipoParaRetornar(null);
    refetch();
  };

  const handleClearSelection = () => {
    setRowSelection({});
    setSelectedEquiposIds(new Set());
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipos Asignados a Personas</h1>
            <p className="text-gray-500 mt-1">
              {data?.paginacion.total || 0} equipos asignados
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex-1">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por persona, serial, inv. entel, acta..."
          isLoading={false}
        />
      </div>

      {/* Filtros en Cascada */}
      <EquipoFiltersCascade
        categoriaId={categoriaId}
        onCategoriaChange={setCategoriaId}
        subcategoriaId={subcategoriaId}
        onSubcategoriaChange={setSubcategoriaId}
        marcaId={marcaId}
        onMarcaChange={setMarcaId}
        modeloId={modeloId}
        onModeloChange={setModeloId}
        onReset={handleResetFilters}
      />

      {/* Badge de selección */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Badge variant="default" className="text-sm">
            {selectedCount} equipo(s) seleccionado(s) {selectedCount > (data?.data.length || 0) && '(de múltiples páginas)'}
          </Badge>
          <Button onClick={handleClearSelection} variant="ghost" size="sm">
            Limpiar selección
          </Button>
        </div>
      )}

      {/* Tabla */}
      <DataTable
        data={data?.data || []}
        columns={columnsPersonas}
        isLoading={isLoading}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        getRowId={(row) => row.id.toString()}
        meta={{
          onView: handleView,
          onRetornarAlmacen: handleRetornarAlmacen,
          onViewHistory: handleViewHistory,
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

      {/* Botón flotante */}
      {selectedCount > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="lg"
            onClick={openMovimiento}
            className="shadow-2xl gap-2 h-14 px-6"
          >
            <TrendingUp className="h-5 w-5" />
            Registrar Movimiento ({selectedCount})
          </Button>
        </div>
      )}

      {/* Modal de Movimiento */}
      <MovimientoModal
        open={isMovimientoOpen}
        onClose={handleMovimientoClose}
        equipos={selectedEquipos}
        ubicacionActual="PERSONA"
      />

      {/* Modal de Retornar a Almacén */}
      <RetornarAlmacenModal
        open={!!equipoParaRetornar}
        onClose={handleRetornarClose}
        equipo={equipoParaRetornar}
        tipoRetorno="PERSONA"
      />

      {/* Modal de Historial */}
      <HistorialModal
        open={!!equipoParaHistorial}
        onClose={() => setEquipoParaHistorial(null)}
        equipo={equipoParaHistorial}
      />

      {/* Modal de Detalle */}
      <EquipoDetalleModal
        open={!!equipoParaDetalle}
        onClose={() => setEquipoParaDetalle(null)}
        equipo={equipoParaDetalle}
        onViewHistory={(equipo) => {
          setEquipoParaDetalle(null);
          setEquipoParaHistorial(equipo);
        }}
      />
    </div>
  );
};