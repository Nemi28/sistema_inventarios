import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { CategoriaTable } from './CategoriaTable';
import { CategoriaFormModal } from './CategoriaFormModal';
import { CategoriaFilters } from './CategoriaFilters';
import { useCategorias } from '../hooks/useCategorias';
import { useSearchCategorias } from '../hooks/useSearchCategorias';
import { useDeleteCategoria } from '../hooks/useDeleteCategoria';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Categoria } from '../types';

export const CategoriasPage = () => {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [ordenar_por, setOrdenarPor] = useState<string>('fecha_creacion');
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC');
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deletingItem, setDeletingItem] = useState<Categoria | null>(null);

  // Hooks personalizados
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();

  // Mutations
  const deleteMutation = useDeleteCategoria();

  // Queries
  const isSearching = debouncedSearch.length > 0;
  const searchQuery = useSearchCategorias(debouncedSearch, page, 20, isSearching);
  const listQuery = useCategorias(
    { page, limit: 20, activo, ordenar_por, orden }
  );
  const { data, isLoading } = isSearching ? searchQuery : listQuery;

  // Handlers
  const handleCreate = () => {
    setEditingCategoria(null);
    open();
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    open();
  };

  const handleDelete = (categoria: Categoria) => {
    setDeletingItem(categoria);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id, {
        onSuccess: () => {
          setDeletingItem(null);
        }
      });
    }
  };

  const handleCloseModal = () => {
    setEditingCategoria(null);
    close();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="text-gray-500 mt-1">
            Administra las categorías de los equipos
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre..."
            isLoading={isSearching && searchQuery.isLoading}
          />
        </div>
        <CategoriaFilters
          activo={activo}
          onActivoChange={setActivo}
          ordenarPor={ordenar_por}
          onOrdenarPorChange={setOrdenarPor}
          orden={orden}
          onOrdenChange={setOrden}
        />
      </div>

      {/* Tabla */}
      <CategoriaTable
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.paginacion}
        currentPage={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      <CategoriaFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        categoria={editingCategoria}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Categoría?"
        description="Estás a punto de eliminar esta categoría del sistema."
        itemName={deletingItem?.nombre}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};