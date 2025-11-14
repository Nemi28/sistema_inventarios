import { useState } from 'react';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/common/SearchBar';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { useModelos } from '../hooks/useModelos';
import { useDeleteModelo } from '../hooks/useDeleteModelo';
import { useSubcategoriasPorCategoria } from '@/features/subcategorias/hooks/useSubcategoriasPorCategoria';
import { useMarcasActivas } from '@/features/marcas/hooks/useMarcasActivas';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { usePermissions } from '@/hooks/usePermissions';
import { Modelo } from '../types';
import { ModeloFormModal } from './ModeloFormModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModelosTabProps {
  categoriaId: number;
}

export const ModelosTab: React.FC<ModelosTabProps> = ({ categoriaId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [subcategoriaFilter, setSubcategoriaFilter] = useState<number | undefined>();
  const [marcaFilter, setMarcaFilter] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);
  const [deletingModelo, setDeletingModelo] = useState<Modelo | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isOpen, open, close } = useDisclosure();
  const { hasPermission } = usePermissions();
  const canCreateEdit = hasPermission(['gestor', 'administrador']);

  const deleteMutation = useDeleteModelo();

  // Queries
  const { data: subcategorias } = useSubcategoriasPorCategoria(categoriaId);
  const { data: marcas } = useMarcasActivas();

  const { data, isLoading } = useModelos({
    page,
    limit: 10,
    categoria_id: categoriaId,
    subcategoria_id: subcategoriaFilter,
    marca_id: marcaFilter,
    nombre: debouncedSearch || undefined,
    activo: true,
  });

  const handleCreate = () => {
    setEditingModelo(null);
    open();
  };

  const handleEdit = (modelo: Modelo) => {
    setEditingModelo(modelo);
    open();
  };

  const handleDelete = (modelo: Modelo) => {
    setDeletingModelo(modelo);
  };

  const confirmDelete = () => {
    if (deletingModelo) {
      deleteMutation.mutate(deletingModelo.id, {
        onSuccess: () => {
          setDeletingModelo(null);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setEditingModelo(null);
    close();
  };

  const clearFilters = () => {
    setSubcategoriaFilter(undefined);
    setMarcaFilter(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Modelos</h2>
          <p className="text-sm text-gray-600">Gestiona los modelos de equipos</p>
        </div>
        {canCreateEdit && (
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Modelo
          </Button>
        )}
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar modelo..."
              isLoading={isLoading}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros desplegables */}
        {showFilters && (
          <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Subcategoría
              </label>
              <Select
                value={subcategoriaFilter?.toString() || 'all'}
                onValueChange={(value) =>
                  setSubcategoriaFilter(value === 'all' ? undefined : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {subcategorias?.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Marca</label>
              <Select
                value={marcaFilter?.toString() || 'all'}
                onValueChange={(value) =>
                  setMarcaFilter(value === 'all' ? undefined : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {marcas?.map((marca) => (
                    <SelectItem key={marca.id} value={marca.id.toString()}>
                      {marca.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de modelos */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcategoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especificaciones
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
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay modelos registrados
                </td>
              </tr>
            ) : (
              data?.data.map((modelo) => (
                <tr key={modelo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{modelo.nombre}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {modelo.subcategoria_nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{modelo.marca_nombre}</span>
                  </td>
                  <td className="px-6 py-4">
                    {modelo.especificaciones_tecnicas ? (
                      <div className="text-xs text-gray-500">
                        {Object.keys(modelo.especificaciones_tecnicas).length} campos
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin especificaciones</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={modelo.activo ? 'bg-green-500' : 'bg-gray-400'}>
                      {modelo.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canCreateEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(modelo)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(modelo)}
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
            Mostrando {data.data.length} de {data.paginacion.total} modelos
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
      <ModeloFormModal
        open={isOpen}
        onOpenChange={handleCloseModal}
        modelo={editingModelo}
        categoriaId={categoriaId}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={!!deletingModelo}
        onOpenChange={(open) => !open && setDeletingModelo(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar Modelo?"
        description="Estás a punto de eliminar este modelo del sistema."
        itemName={deletingModelo?.nombre}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};