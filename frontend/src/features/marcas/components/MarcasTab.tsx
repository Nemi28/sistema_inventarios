import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { useMarcas } from '../hooks/useMarcas';
import { useDeleteMarca } from '../hooks/useDeleteMarca';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { usePermissions } from '@/hooks/usePermissions';
import { Marca } from '../types';
import { MarcaFormModal } from './MarcaFormModal';

export const MarcasTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
  const [deletingMarca, setDeletingMarca] = useState<Marca | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();
  const { hasPermission } = usePermissions();
  const canCreateEdit = hasPermission(['gestor', 'administrador']);

  const deleteMutation = useDeleteMarca();

  const { data, isLoading } = useMarcas({
    page,
    limit: 10,
    nombre: debouncedSearch || undefined,
    activo: true,
  });

  const handleCreate = () => {
    setEditingMarca(null);
    open();
  };

  const handleEdit = (marca: Marca) => {
    setEditingMarca(marca);
    open();
  };

  const handleDelete = (marca: Marca) => {
    setDeletingMarca(marca);
  };

  const confirmDelete = () => {
    if (deletingMarca) {
      deleteMutation.mutate(deletingMarca.id, {
        onSuccess: () => {
          setDeletingMarca(null);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setEditingMarca(null);
    close();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Marcas</h2>
          <p className="text-sm text-gray-600">Gestiona las marcas de equipos</p>
        </div>
        {canCreateEdit && (
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Marca
          </Button>
        )}
      </div>

      {/* Búsqueda */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar marca..."
        isLoading={isLoading}
      />

      {/* Lista de marcas */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
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
                  No hay marcas registradas
                </td>
              </tr>
            ) : (
              data?.data.map((marca) => (
                <tr key={marca.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{marca.nombre}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {marca.total_modelos || 0} modelos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={marca.activo ? 'bg-green-500' : 'bg-gray-400'}>
                      {marca.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canCreateEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(marca)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(marca)}
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
      Mostrando {data.data.length} de {data.paginacion.total} marcas
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
      <MarcaFormModal open={isOpen} onOpenChange={handleCloseModal} marca={editingMarca} />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={!!deletingMarca}
        onOpenChange={(open) => !open && setDeletingMarca(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Marca?"
        description="Estás a punto de eliminar esta marca del sistema."
        itemName={deletingMarca?.nombre}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};