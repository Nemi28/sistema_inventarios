import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { SKUTable } from './SKUTable';
import { SKUFormModal } from './SKUFormModal';
import { SKUFilters } from './SKUFilters';
import { useSKUs } from '../hooks/useSKUs';
import { useSearchSKUs } from '../hooks/useSearchSKUs';
import { useDeleteSKU } from '../hooks/useDeleteSKU';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { SKU } from '../types';

export const SKUsPage = () => {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [ordenar_por, setOrdenarPor] = useState<string>('fecha_creacion');
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC');
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [deletingItem, setDeletingItem] = useState<SKU | null>(null);

  // Hooks personalizados
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();

  // Mutations
  const deleteMutation = useDeleteSKU();

  // Queries
  const isSearching = debouncedSearch.length > 0;
  const searchQuery = useSearchSKUs(debouncedSearch, page, 20, isSearching);
  const listQuery = useSKUs(
    { page, limit: 20, activo, ordenar_por, orden }
  );
  const { data, isLoading } = isSearching ? searchQuery : listQuery;

  // Handlers
  const handleCreate = () => {
    setEditingSKU(null);
    open();
  };

  const handleEdit = (sku: SKU) => {
    setEditingSKU(sku);
    open();
  };

  const handleDelete = (sku: SKU) => {
    setDeletingItem(sku);
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
    setEditingSKU(null);
    close();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de SKUs</h1>
          <p className="text-gray-500 mt-1">
            Administra los códigos de SKU del sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo SKU
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código o descripción..."
            isLoading={isSearching && searchQuery.isLoading}
          />
        </div>
        <SKUFilters
          activo={activo}
          onActivoChange={setActivo}
          ordenarPor={ordenar_por}
          onOrdenarPorChange={setOrdenarPor}
          orden={orden}
          onOrdenChange={setOrden}
        />
      </div>

      {/* Tabla */}
      <SKUTable
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.paginacion}
        currentPage={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulario */}
      <SKUFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        sku={editingSKU}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar SKU?"
        description="Estás a punto de eliminar este SKU del sistema."
        itemName={deletingItem?.codigo_sku}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};