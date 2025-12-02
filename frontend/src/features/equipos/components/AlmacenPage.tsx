import { useState, useEffect, useMemo } from 'react';
import { Plus, Warehouse, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { EquipoFormModal } from './EquipoFormModal';
import { EquipoFiltersCascade } from './EquipoFiltersCascade';
import { MovimientoModal } from '@/features/movimientos/components/MovimientoModal';
import { HistorialModal } from '@/features/movimientos/components/HistorialModal';
import { EquipoDetalleModal } from './EquipoDetalleModal';
import { EditarEquipoRapidoModal } from './EditarEquipoRapidoModal';
import { useEquiposAlmacen } from '../hooks/useEquiposAlmacen';
import { useDeleteEquipo } from '../hooks/useDeleteEquipo';
import { useDisclosure } from '@/hooks/useDisclosure';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebounce } from '@/hooks/useDebounce';
import { columnsAlmacen } from './columnsAlmacen';
import { Equipo } from '../types';
import { RowSelectionState } from '@tanstack/react-table';
import { exportarEquiposExcel } from '../services/equipos.export.service';
import { toast } from 'sonner';

export const AlmacenPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [deletingItem, setDeletingItem] = useState<Equipo | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Debounce para búsqueda (espera 400ms después de dejar de escribir)
  const debouncedSearch = useDebounce(searchTerm, 400);
  
  // Filtros en cascada
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [subcategoriaId, setSubcategoriaId] = useState<number | undefined>();
  const [marcaId, setMarcaId] = useState<number | undefined>();
  const [modeloId, setModeloId] = useState<number | undefined>();

  // Selección múltiple PERSISTENTE por ID
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedEquiposIds, setSelectedEquiposIds] = useState<Set<number>>(new Set());

  // Modal de historial
  const [equipoParaHistorial, setEquipoParaHistorial] = useState<Equipo | null>(null);

  // Modal de detalle
  const [equipoParaDetalle, setEquipoParaDetalle] = useState<Equipo | null>(null);

  // Modal de edición rápida
  const [equipoParaEditarRapido, setEquipoParaEditarRapido] = useState<Equipo | null>(null);

  const { isOpen, open, close } = useDisclosure();
  const { 
    isOpen: isMovimientoOpen, 
    open: openMovimiento, 
    close: closeMovimiento 
  } = useDisclosure();
  const { hasPermission } = usePermissions();

  const canCreateEdit = hasPermission(['gestor', 'administrador']);
  const deleteMutation = useDeleteEquipo();

  const { data, isLoading, refetch } = useEquiposAlmacen({
    page,
    limit: 20,
    categoria_id: categoriaId,
    subcategoria_id: subcategoriaId,
    marca_id: marcaId,
    modelo_id: modeloId,
    busqueda: debouncedSearch || undefined,
    ordenar_por: 'e.fecha_creacion',
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

  const handleCreate = () => {
    setEditingEquipo(null);
    open();
  };

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    open();
  };

  const handleDelete = (equipo: Equipo) => {
    setDeletingItem(equipo);
  };

  const handleView = (equipo: Equipo) => {
    setEquipoParaDetalle(equipo);
  };

  const handleViewHistory = (equipo: Equipo) => {
    setEquipoParaHistorial(equipo);
  };

  const handleEditRapido = (equipo: Equipo) => {
    setEquipoParaEditarRapido(equipo);
  };

  const handleCloseEditRapido = () => {
    setEquipoParaEditarRapido(null);
    refetch();
  };

  const confirmDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(
        { id: deletingItem.id, equipo: deletingItem },
        {
          onSuccess: () => {
            setDeletingItem(null);
            refetch();
          },
        }
      );
    }
  };

  const handleCloseModal = () => {
    setEditingEquipo(null);
    close();
    refetch();
  };

  const handleResetFilters = () => {
    setCategoriaId(undefined);
    setSubcategoriaId(undefined);
    setMarcaId(undefined);
    setModeloId(undefined);
    setPage(1);
  };

  // Exportar a Excel
  const handleExportar = async () => {
    try {
      setIsExporting(true);
      await exportarEquiposExcel({
        ubicacion: 'ALMACEN',
        categoria_id: categoriaId,
        subcategoria_id: subcategoriaId,
        marca_id: marcaId,
        modelo_id: modeloId,
        busqueda: debouncedSearch || undefined,
      });
      toast.success('Excel exportado correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el archivo');
    } finally {
      setIsExporting(false);
    }
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

  // Obtener equipos seleccionados de TODAS las páginas
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

  const handleClearSelection = () => {
    setRowSelection({});
    setSelectedEquiposIds(new Set());
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Warehouse className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Almacén</h1>
            <p className="text-gray-500 mt-1">
              {data?.paginacion.total || 0} equipos disponibles en almacén
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCreateEdit && (
            <>
              <Button
                variant="outline"
                onClick={handleExportar}
                disabled={isExporting || isLoading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar Excel'}
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Equipo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex-1">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por serial, inv. entel, modelo, marca..."
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
        columns={columnsAlmacen}
        isLoading={isLoading}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        getRowId={(row) => row.id.toString()}
        meta={{
          onView: handleView,
          onEdit: handleEdit,
          onEditRapido: handleEditRapido,
          onDelete: handleDelete,
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

      {/* Modal de Formulario */}
      <EquipoFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        equipo={editingEquipo}
      />

      {/* Modal de Movimiento */}
      <MovimientoModal
        open={isMovimientoOpen}
        onClose={handleMovimientoClose}
        equipos={selectedEquipos}
        ubicacionActual="ALMACEN"
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

      {/* Modal de Edición Rápida */}
      <EditarEquipoRapidoModal
        open={!!equipoParaEditarRapido}
        onClose={handleCloseEditRapido}
        equipo={equipoParaEditarRapido}
        vista="ALMACEN"
      />

      {/* Modal de Confirmación */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Equipo?"
        description="Estás a punto de eliminar este equipo del sistema."
        itemName={deletingItem?.inv_entel || deletingItem?.numero_serie || 'Equipo'}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};