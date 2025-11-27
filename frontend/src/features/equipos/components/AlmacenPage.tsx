import { useState, useEffect, useMemo } from 'react';
import { Plus, Warehouse, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { EquipoFormModal } from './EquipoFormModal';
import { EquipoFiltersCascade } from './EquipoFiltersCascade';
import { MovimientoModal } from '@/features/movimientos/components/MovimientoModal';
import { useEquiposAlmacen } from '../hooks/useEquiposAlmacen';
import { useDeleteEquipo } from '../hooks/useDeleteEquipo';
import { useDisclosure } from '@/hooks/useDisclosure';
import { usePermissions } from '@/hooks/usePermissions';
import { columnsAlmacen } from './columnsAlmacen';
import { Equipo } from '../types';
import { RowSelectionState } from '@tanstack/react-table';

export const AlmacenPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [deletingItem, setDeletingItem] = useState<Equipo | null>(null);
  
  // Filtros en cascada
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [subcategoriaId, setSubcategoriaId] = useState<number | undefined>();
  const [marcaId, setMarcaId] = useState<number | undefined>();
  const [modeloId, setModeloId] = useState<number | undefined>();

  // ✅ NUEVO: Selección múltiple PERSISTENTE por ID
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedEquiposIds, setSelectedEquiposIds] = useState<Set<number>>(new Set());

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
    ordenar_por: 'e.fecha_creacion',
    orden: 'DESC',
  });

  useEffect(() => {
    setPage(1);
  }, [categoriaId, subcategoriaId, marcaId, modeloId]);

  // ✅ NUEVO: Sincronizar rowSelection con selectedEquiposIds
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

  // ✅ NUEVO: Manejar cambios en la selección
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

  // ✅ NUEVO: Obtener equipos seleccionados de TODAS las páginas
  const selectedEquipos = useMemo(() => {
    // Esta función se ejecutará cuando abramos el modal
    // Por ahora retornamos los de la página actual
    return (data?.data || []).filter((equipo) => selectedEquiposIds.has(equipo.id));
  }, [data, selectedEquiposIds]);

  const selectedCount = selectedEquiposIds.size;

  const handleMovimientoClose = () => {
    closeMovimiento();
    setRowSelection({});
    setSelectedEquiposIds(new Set()); // ✅ Limpiar Set
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
        {canCreateEdit && (
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Equipo
          </Button>
        )}
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
        getRowId={(row) => row.id.toString()} // ✅ CRÍTICO: Usar ID real
        meta={{
          onEdit: handleEdit,
          onDelete: handleDelete,
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