import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { OrdenesCompraTable } from './OrdenesCompraTable';
import { OrdenCompraFormModal } from './OrdenCompraFormModal';
import { OrdenCompraFilters } from './OrdenCompraFilters';
import { useOrdenesCompra } from '../hooks/useOrdenesCompra';
import { useSearchOrdenesCompra } from '../hooks/useSearchOrdenesCompra';
import { useDeleteOrdenCompra } from '../hooks/useDeleteOrdenCompra';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { usePermissions } from '@/hooks/usePermissions';
import { OrdenCompra } from '../types';

export const OrdenesCompraPage = () => {
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);
  const [ordenar_por, setOrdenarPor] = useState<string>('fecha_creacion');
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC');
  const [editingOrdenCompra, setEditingOrdenCompra] = useState<OrdenCompra | null>(null);
  const [deletingItem, setDeletingItem] = useState<OrdenCompra | null>(null);

  // Hooks personalizados
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();
  const { hasPermission, userRole } = usePermissions();

  // Permisos
  const canCreateEdit = hasPermission(['gestor', 'administrador']);

  // Mutations
  const deleteMutation = useDeleteOrdenCompra();

  // Queries
  const isSearching = debouncedSearch.length > 0;
  const searchQuery = useSearchOrdenesCompra(debouncedSearch, page, 20, isSearching);
  const listQuery = useOrdenesCompra({
    page,
    limit: 20,
    activo,
    ordenar_por,
    orden,
  });
  const { data, isLoading } = isSearching ? searchQuery : listQuery;

  // Handlers
  const handleCreate = () => {
    setEditingOrdenCompra(null);
    open();
  };

  const handleEdit = (ordenCompra: OrdenCompra) => {
    setEditingOrdenCompra(ordenCompra);
    open();
  };

  const handleDelete = (ordenCompra: OrdenCompra) => {
    setDeletingItem(ordenCompra);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id, {
        onSuccess: () => {
          setDeletingItem(null);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setEditingOrdenCompra(null);
    close();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Órdenes de Compra
          </h1>
          <p className="text-gray-500 mt-1">
            Administra las órdenes de compra de equipos
          </p>
        </div>
        {canCreateEdit && (
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        )}
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por número de orden o detalle..."
            isLoading={isSearching && searchQuery.isLoading}
          />
        </div>
        <OrdenCompraFilters
          activo={activo}
          onActivoChange={setActivo}
          ordenarPor={ordenar_por}
          onOrdenarPorChange={setOrdenarPor}
          orden={orden}
          onOrdenChange={setOrden}
        />
      </div>

      {/* Tabla */}
      <OrdenesCompraTable
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.paginacion}
        currentPage={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        userRole={userRole}
      />

      {/* Modal de Formulario */}
      <OrdenCompraFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        ordenCompra={editingOrdenCompra}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Orden de Compra?"
        description="Estás a punto de eliminar esta orden del sistema."
        itemName={deletingItem?.numero_orden}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};