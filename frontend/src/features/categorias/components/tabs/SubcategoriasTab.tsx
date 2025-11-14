import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { useSubcategorias } from '@/features/subcategorias/hooks/useSubcategorias';
import { useDeleteSubcategoria } from '@/features/subcategorias/hooks/useDeleteSubcategoria';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { usePermissions } from '@/hooks/usePermissions';
import { Subcategoria } from '@/features/subcategorias/types';
import { SubcategoriaFormModal } from './SubcategoriaFormModal';

interface SubcategoriasTabProps {
  categoriaId: number;
}

export const SubcategoriasTab: React.FC<SubcategoriasTabProps> = ({ categoriaId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editingSubcategoria, setEditingSubcategoria] = useState<Subcategoria | null>(null);
  const [deletingSubcategoria, setDeletingSubcategoria] = useState<Subcategoria | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();
  const { hasPermission } = usePermissions();
  const canCreateEdit = hasPermission(['gestor', 'administrador']);

  const deleteMutation = useDeleteSubcategoria();

  const { data, isLoading } = useSubcategorias({
    page,
    limit: 10,
    categoria_id: categoriaId,
    nombre: debouncedSearch || undefined,
    activo: true,
  });

  const handleCreate = () => {
    setEditingSubcategoria(null);
    open();
  };

  const handleEdit = (subcategoria: Subcategoria) => {
    setEditingSubcategoria(subcategoria);
    open();
  };

  const handleDelete = (subcategoria: Subcategoria) => {
    setDeletingSubcategoria(subcategoria);
  };

  const confirmDelete = () => {
    if (deletingSubcategoria) {
      deleteMutation.mutate(deletingSubcategoria.id, {
        onSuccess: () => {
          setDeletingSubcategoria(null);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setEditingSubcategoria(null);
    close();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Subcategorías</h2>
          <p className="text-sm text-gray-600">
            Gestiona las subcategorías de esta categoría
          </p>
        </div>
        {canCreateEdit && (
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Subcategoría
          </Button>
        )}
      </div>

      {/* Búsqueda */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar subcategoría..."
        isLoading={isLoading}
      />

      {/* Lista de subcategorías */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcategoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay subcategorías registradas
                </td>
              </tr>
            ) : (
              data?.data.map((subcategoria) => (
                <tr key={subcategoria.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {subcategoria.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {subcategoria.total_modelos || 0} modelos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={subcategoria.activo ? 'bg-green-500' : 'bg-gray-400'}>
                      {subcategoria.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canCreateEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(subcategoria)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(subcategoria)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {data?.paginacion && data.paginacion.total_paginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {data.data.length} de {data.paginacion.total} subcategorías
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              Página {page} de {data.paginacion.total_paginas}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= data.paginacion.total_paginas}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      <SubcategoriaFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        subcategoria={editingSubcategoria}
        categoriaId={categoriaId}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={!!deletingSubcategoria}
        onOpenChange={(open) => !open && setDeletingSubcategoria(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Subcategoría?"
        description="Estás a punto de eliminar esta subcategoría del sistema."
        itemName={deletingSubcategoria?.nombre}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};