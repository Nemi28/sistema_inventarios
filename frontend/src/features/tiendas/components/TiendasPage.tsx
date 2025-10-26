import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { TiendaTable } from './TiendaTable';
import { TiendaFormModal } from './TiendaFormModal';
import { TiendaFilters } from './TiendaFilters';
import { useTiendas } from '../hooks/useTiendas';
import { useSearchTiendas } from '../hooks/useSearchTiendas';
import { useDeleteTienda } from '../hooks/useDeleteTienda';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Tienda } from '../types';

export const TiendasPage = () => {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [perfilLocal, setPerfilLocal] = useState<string | undefined>(undefined);
  const [ordenar_por, setOrdenarPor] = useState<string>('fecha_creacion');
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC');
  const [editingTienda, setEditingTienda] = useState<Tienda | null>(null);
  const [deletingItem, setDeletingItem] = useState<Tienda | null>(null);

  // Hooks personalizados
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();

  // Mutations
  const deleteMutation = useDeleteTienda();

  // Queries
  const isSearching = debouncedSearch.length > 0;
  const searchQuery = useSearchTiendas(debouncedSearch, page, 20, isSearching);
  const listQuery = useTiendas({
    page,
    limit: 20,
    activo,
    perfil_local: perfilLocal,
    ordenar_por,
    orden,
  });

  const { data, isLoading } = isSearching ? searchQuery : listQuery;

  // Handlers
  const handleCreate = () => {
    setEditingTienda(null);
    open();
  };

  const handleEdit = (tienda: Tienda) => {
    setEditingTienda(tienda);
    open();
  };

  const handleDelete = (tienda: Tienda) => {
    setDeletingItem(tienda);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(
        { id: deletingItem.id, tienda: deletingItem },
        {
          onSuccess: () => {
            setDeletingItem(null);
          },
        }
      );
    }
  };

  const handleCloseModal = () => {
    setEditingTienda(null);
    close();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Tiendas
          </h1>
          <p className="text-gray-500 mt-1">
            Administra todas las Tiendas
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tienda
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por PDV, nombre, dirección, ubigeo, socio..."
            isLoading={isSearching && searchQuery.isLoading}
          />
        </div>
        <TiendaFilters
          activo={activo}
          onActivoChange={setActivo}
          perfilLocal={perfilLocal}
          onPerfilLocalChange={setPerfilLocal}
          ordenarPor={ordenar_por}
          onOrdenarPorChange={setOrdenarPor}
          orden={orden}
          onOrdenChange={setOrden}
        />
      </div>

      {/* Tabla */}
      <TiendaTable
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.paginacion}
        currentPage={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      <TiendaFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        tienda={editingTienda}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Tienda?"
        description="Estás a punto de eliminar esta tienda del sistema."
        itemName={deletingItem?.nombre_tienda}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};