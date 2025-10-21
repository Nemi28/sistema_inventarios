import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { SocioTable } from './SocioTable';
import { SocioFormModal } from './SocioFormModal';
import { SocioFilters } from './SocioFilters';
import { useSocios } from '../hooks/useSocios';
import { useSearchSocios } from '../hooks/useSearchSocios';
import { useDeleteSocio } from '../hooks/useDeleteSocio';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Socio } from '../types';

export const SociosPage = () => {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [ordenar_por, setOrdenarPor] = useState<string>('fecha_creacion');
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC');
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [deletingItem, setDeletingItem] = useState<Socio | null>(null);

  // Hooks personalizados
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();

  // Mutations
  const deleteMutation = useDeleteSocio();

  // Queries
  const isSearching = debouncedSearch.length > 0;
  const searchQuery = useSearchSocios(debouncedSearch, page, 20, isSearching);
  const listQuery = useSocios(
    { page, limit: 20, activo, ordenar_por, orden }
  );

  const { data, isLoading } = isSearching ? searchQuery : listQuery;

  // Handlers
  const handleCreate = () => {
    setEditingSocio(null);
    open();
  };

  const handleEdit = (socio: Socio) => {
    setEditingSocio(socio);
    open();
  };

  const handleDelete = (socio: Socio) => {
    setDeletingItem(socio);
  };

const confirmDelete = () => {
  if (deletingItem) {
    deleteMutation.mutate({ id: deletingItem.id, socio: deletingItem }, {
      onSuccess: () => {
        setDeletingItem(null);
      }
    });
  }
};

  const handleCloseModal = () => {
    setEditingSocio(null);
    close();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Socios</h1>
          <p className="text-gray-500 mt-1">
            Administra los socios de negocio del sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Socio
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por razón social o RUC..."
            isLoading={isSearching && searchQuery.isLoading}
          />
        </div>
        <SocioFilters
          activo={activo}
          onActivoChange={setActivo}
          ordenarPor={ordenar_por}
          onOrdenarPorChange={setOrdenarPor}
          orden={orden}
          onOrdenChange={setOrden}
        />
      </div>

      {/* Tabla */}
      <SocioTable
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.paginacion}
        currentPage={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      <SocioFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        socio={editingSocio}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Socio?"
        description="Estás a punto de eliminar este socio de negocio del sistema."
        itemName={deletingItem?.razon_social}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};