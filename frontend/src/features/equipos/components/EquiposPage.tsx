import { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { EquiposTable } from './EquiposTable';
import { EquipoFormModal } from './EquipoFormModal';
import { EquiposMultipleModal } from './EquiposMultipleModal';
import { EquipoDetailModal } from './EquipoDetailModal';
import { EquipoFilters } from './EquipoFilters';
import { useEquipos } from '../hooks/useEquipos';
import { useSearchEquipos } from '../hooks/useSearchEquipos';
import { useDeleteEquipo } from '../hooks/useDeleteEquipo';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { usePermissions } from '@/hooks/usePermissions';
import { Equipo } from '../types';

export const EquiposPage = () => {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [ordenar_por, setOrdenarPor] = useState<string>('fecha_creacion');
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC');
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [viewingEquipo, setViewingEquipo] = useState<Equipo | null>(null);
  const [deletingItem, setDeletingItem] = useState<Equipo | null>(null);

  // Hooks personalizados
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();
  const {
    isOpen: isMultipleOpen,
    open: openMultiple,
    close: closeMultiple,
  } = useDisclosure();
  const { hasPermission, userRole } = usePermissions();

  // Permisos
  const canCreateEdit = hasPermission(['gestor', 'administrador']);

  // Mutations
  const deleteMutation = useDeleteEquipo();

  // Queries
  const isSearching = debouncedSearch.length > 0;
  const searchQuery = useSearchEquipos(debouncedSearch, page, 20, isSearching);
  const listQuery = useEquipos({
    page,
    limit: 20,
    activo,
    estado,
    ordenar_por,
    orden,
  });

  const { data, isLoading } = isSearching ? searchQuery : listQuery;

  // Handlers
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

  const handleViewDetail = (equipo: Equipo) => {
    setViewingEquipo(equipo);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(
        { id: deletingItem.id, equipo: deletingItem },
        {
          onSuccess: () => {
            setDeletingItem(null);
          },
        }
      );
    }
  };

  const handleCloseModal = () => {
    setEditingEquipo(null);
    close();
  };

  const handleCloseDetailModal = () => {
    setViewingEquipo(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Equipos
          </h1>
          <p className="text-gray-500 mt-1">
            Administra todos los equipos del inventario
          </p>
        </div>
        {canCreateEdit && (
          <div className="flex gap-2">
            <Button
              onClick={openMultiple}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Layers className="mr-2 h-4 w-4" />
              Registro Múltiple
            </Button>
            <Button onClick={handleCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Equipo
            </Button>
          </div>
        )}
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, marca, modelo, número de serie, inv_entel..."
            isLoading={isSearching && searchQuery.isLoading}
          />
        </div>
        <EquipoFilters
          activo={activo}
          onActivoChange={setActivo}
          estado={estado}
          onEstadoChange={setEstado}
          ordenarPor={ordenar_por}
          onOrdenarPorChange={setOrdenarPor}
          orden={orden}
          onOrdenChange={setOrden}
        />
      </div>

      {/* Tabla */}
      <EquiposTable
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.paginacion}
        currentPage={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetail={handleViewDetail}
        userRole={userRole}
      />

      {/* Modal de Formulario Individual */}
      <EquipoFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        equipo={editingEquipo}
      />

      {/* Modal de Registro Múltiple */}
      <EquiposMultipleModal open={isMultipleOpen} onOpenChange={closeMultiple} />

      {/* Modal de Detalle */}
      <EquipoDetailModal
        open={!!viewingEquipo}
        onOpenChange={handleCloseDetailModal}
        equipo={viewingEquipo}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Equipo?"
        description="Estás a punto de eliminar este equipo del sistema."
        itemName={deletingItem?.nombre}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};