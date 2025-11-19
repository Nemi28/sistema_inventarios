import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { EquipoTable } from './EquipoTable';
import { EquipoFormModal } from './EquipoFormModal';
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
  const [estadoActual, setEstadoActual] = useState<string | undefined>(undefined);
  const [ubicacionActual, setUbicacionActual] = useState<string | undefined>(undefined);
  const [tipoPropiedad, setTipoPropiedad] = useState<string | undefined>(undefined);
  const [ordenar_por, setOrdenarPor] = useState<string>('e.fecha_creacion');
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC');
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [deletingItem, setDeletingItem] = useState<Equipo | null>(null);

  // Hooks personalizados
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();
  const { hasPermission } = usePermissions();

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
    estado_actual: estadoActual,
    ubicacion_actual: ubicacionActual,
    tipo_propiedad: tipoPropiedad,
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
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Equipo
          </Button>
        )}
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por serial, inv. entel, modelo, marca, tienda..."
            isLoading={isSearching && searchQuery.isLoading}
          />
        </div>
        <EquipoFilters
          activo={activo}
          onActivoChange={setActivo}
          estadoActual={estadoActual}
          onEstadoActualChange={setEstadoActual}
          ubicacionActual={ubicacionActual}
          onUbicacionActualChange={setUbicacionActual}
          tipoPropiedad={tipoPropiedad}
          onTipoPropiedadChange={setTipoPropiedad}
          ordenarPor={ordenar_por}
          onOrdenarPorChange={setOrdenarPor}
          orden={orden}
          onOrdenChange={setOrden}
        />
      </div>

      {/* Tabla */}
      <EquipoTable
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.paginacion}
        currentPage={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      <EquipoFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        equipo={editingEquipo}
      />

      {/* Modal de Confirmación de Eliminación */}
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