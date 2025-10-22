import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface TiendaFiltersProps {
  activo?: boolean;
  onActivoChange: (value: boolean | undefined) => void;
  perfilLocal?: string;
  onPerfilLocalChange: (value: string | undefined) => void;
  ordenarPor: string;
  onOrdenarPorChange: (value: string) => void;
  orden: 'ASC' | 'DESC';
  onOrdenChange: (value: 'ASC' | 'DESC') => void;
}

export const TiendaFilters = ({
  activo,
  onActivoChange,
  perfilLocal,
  onPerfilLocalChange,
  ordenarPor,
  onOrdenarPorChange,
  orden,
  onOrdenChange,
}: TiendaFiltersProps) => {
  const hasFilters = activo !== undefined || perfilLocal !== undefined;

  const clearFilters = () => {
    onActivoChange(undefined);
    onPerfilLocalChange(undefined);
    onOrdenarPorChange('fecha_creacion');
    onOrdenChange('DESC');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Filtro por estado */}
      <Select
        value={activo === undefined ? 'todos' : activo ? 'activos' : 'inactivos'}
        onValueChange={(value) => {
          if (value === 'todos') onActivoChange(undefined);
          else if (value === 'activos') onActivoChange(true);
          else onActivoChange(false);
        }}
      >
        <SelectTrigger className="w-[150px]">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="activos">Solo Activos</SelectItem>
          <SelectItem value="inactivos">Solo Inactivos</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro por perfil local */}
      <Select
        value={perfilLocal || 'todos'}
        onValueChange={(value) => {
          onPerfilLocalChange(value === 'todos' ? undefined : value);
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Perfil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los perfiles</SelectItem>
          <SelectItem value="TPF">TPF</SelectItem>
          <SelectItem value="TPF - TC">TPF - TC</SelectItem>
        </SelectContent>
      </Select>

      {/* Ordenar por */}
      <Select value={ordenarPor} onValueChange={onOrdenarPorChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fecha_creacion">Fecha Creación</SelectItem>
          <SelectItem value="nombre_tienda">Nombre Tienda</SelectItem>
          <SelectItem value="pdv">PDV</SelectItem>
        </SelectContent>
      </Select>

      {/* Orden */}
      <Select value={orden} onValueChange={onOrdenChange as any}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DESC">Más recientes</SelectItem>
          <SelectItem value="ASC">Más antiguos</SelectItem>
        </SelectContent>
      </Select>

      {/* Limpiar filtros */}
      {hasFilters && (
        <Button
          type="button"
          className="h-10 bg-transparent hover:bg-gray-100 text-gray-700"
          onClick={clearFilters}
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
};