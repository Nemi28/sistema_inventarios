import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { obtenerCategorias } from '@/features/categorias/services/categorias.service';
import { obtenerSubcategoriasPorCategoria } from '@/features/subcategorias/services/subcategorias.service';
import { obtenerMarcasPorSubcategoria } from '@/features/marcas/services/marcas.service';
import { obtenerModelosPorMarcaYSubcategoria } from '@/features/modelos/services/modelos.service';

interface EquipoFiltersCascadeProps {
  categoriaId?: number;
  onCategoriaChange: (value?: number) => void;
  subcategoriaId?: number;
  onSubcategoriaChange: (value?: number) => void;
  marcaId?: number;
  onMarcaChange: (value?: number) => void;
  modeloId?: number;
  onModeloChange: (value?: number) => void;
  onReset: () => void;
}

export const EquipoFiltersCascade = ({
  categoriaId,
  onCategoriaChange,
  subcategoriaId,
  onSubcategoriaChange,
  marcaId,
  onMarcaChange,
  modeloId,
  onModeloChange,
  onReset,
}: EquipoFiltersCascadeProps) => {
  // Queries en cascada
  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias-filtro'],
    queryFn: obtenerCategorias,
  });

  const { data: subcategorias = [], isLoading: loadingSubcategorias } = useQuery({
    queryKey: ['subcategorias-filtro', categoriaId],
    queryFn: () => obtenerSubcategoriasPorCategoria(categoriaId!),
    enabled: !!categoriaId,
  });

  const { data: marcas = [], isLoading: loadingMarcas } = useQuery({
    queryKey: ['marcas-filtro', subcategoriaId],
    queryFn: () => obtenerMarcasPorSubcategoria(subcategoriaId!),
    enabled: !!subcategoriaId,
  });

  const { data: modelos = [], isLoading: loadingModelos } = useQuery({
    queryKey: ['modelos-filtro', marcaId, subcategoriaId],
    queryFn: () => obtenerModelosPorMarcaYSubcategoria(marcaId!, subcategoriaId!),
    enabled: !!marcaId && !!subcategoriaId,
  });

  // Resetear filtros dependientes cuando cambia un filtro padre
  useEffect(() => {
    if (!categoriaId) {
      onSubcategoriaChange(undefined);
      onMarcaChange(undefined);
      onModeloChange(undefined);
    }
  }, [categoriaId, onSubcategoriaChange, onMarcaChange, onModeloChange]);

  useEffect(() => {
    if (!subcategoriaId) {
      onMarcaChange(undefined);
      onModeloChange(undefined);
    }
  }, [subcategoriaId, onMarcaChange, onModeloChange]);

  useEffect(() => {
    if (!marcaId) {
      onModeloChange(undefined);
    }
  }, [marcaId, onModeloChange]);

  const hasActiveFilters = categoriaId || subcategoriaId || marcaId || modeloId;

  const handleCategoriaChange = useCallback((value: string) => {
    if (value === 'all') {
      onCategoriaChange(undefined);
    } else {
      onCategoriaChange(parseInt(value));
    }
  }, [onCategoriaChange]);

  const handleSubcategoriaChange = useCallback((value: string) => {
    if (value === 'all') {
      onSubcategoriaChange(undefined);
    } else {
      onSubcategoriaChange(parseInt(value));
    }
  }, [onSubcategoriaChange]);

  const handleMarcaChange = useCallback((value: string) => {
    if (value === 'all') {
      onMarcaChange(undefined);
    } else {
      onMarcaChange(parseInt(value));
    }
  }, [onMarcaChange]);

  const handleModeloChange = useCallback((value: string) => {
    if (value === 'all') {
      onModeloChange(undefined);
    } else {
      onModeloChange(parseInt(value));
    }
  }, [onModeloChange]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Categoría */}
      <div className="w-48">
        <Select
          value={categoriaId?.toString() || 'all'}
          onValueChange={handleCategoriaChange}
          disabled={loadingCategorias}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategoría */}
      <div className="w-48">
        <Select
          value={subcategoriaId?.toString() || 'all'}
          onValueChange={handleSubcategoriaChange}
          disabled={!categoriaId || loadingSubcategorias || subcategorias.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Subcategoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {subcategorias.map((sub) => (
              <SelectItem key={sub.id} value={sub.id.toString()}>
                {sub.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Marca */}
      <div className="w-48">
        <Select
          value={marcaId?.toString() || 'all'}
          onValueChange={handleMarcaChange}
          disabled={!subcategoriaId || loadingMarcas || marcas.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {marcas.map((marca) => (
              <SelectItem key={marca.id} value={marca.id.toString()}>
                {marca.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modelo */}
      <div className="w-64">
        <Select
          value={modeloId?.toString() || 'all'}
          onValueChange={handleModeloChange}
          disabled={!marcaId || !subcategoriaId || loadingModelos || modelos.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {modelos.map((modelo) => (
              <SelectItem key={modelo.id} value={modelo.id.toString()}>
                {modelo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botón limpiar filtros */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
};