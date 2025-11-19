import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface EquipoFiltersProps {
  activo?: boolean;
  onActivoChange: (value: boolean | undefined) => void;
  estadoActual?: string;
  onEstadoActualChange: (value: string | undefined) => void;
  ubicacionActual?: string;
  onUbicacionActualChange: (value: string | undefined) => void;
  tipoPropiedad?: string;
  onTipoPropiedadChange: (value: string | undefined) => void;
  ordenarPor: string;
  onOrdenarPorChange: (value: string) => void;
  orden: 'ASC' | 'DESC';
  onOrdenChange: (value: 'ASC' | 'DESC') => void;
}

export const EquipoFilters = ({
  activo,
  onActivoChange,
  estadoActual,
  onEstadoActualChange,
  ubicacionActual,
  onUbicacionActualChange,
  tipoPropiedad,
  onTipoPropiedadChange,
  ordenarPor,
  onOrdenarPorChange,
  orden,
  onOrdenChange,
}: EquipoFiltersProps) => {
  const hasFilters = 
    activo !== undefined || 
    estadoActual !== undefined || 
    ubicacionActual !== undefined ||
    tipoPropiedad !== undefined;

  const clearFilters = () => {
    onActivoChange(undefined);
    onEstadoActualChange(undefined);
    onUbicacionActualChange(undefined);
    onTipoPropiedadChange(undefined);
    onOrdenarPorChange('e.fecha_creacion');
    onOrdenChange('DESC');
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Filtro por estado activo */}
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

      {/* Filtro por estado actual */}
      <Select
        value={estadoActual || 'todos'}
        onValueChange={(value) => {
          onEstadoActualChange(value === 'todos' ? undefined : value);
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="OPERATIVO">Operativo</SelectItem>
          <SelectItem value="POR_VALIDAR">Por Validar</SelectItem>
          <SelectItem value="EN_GARANTIA">En Garantía</SelectItem>
          <SelectItem value="INOPERATIVO">Inoperativo</SelectItem>
          <SelectItem value="BAJA">Baja</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro por ubicación */}
      <Select
        value={ubicacionActual || 'todos'}
        onValueChange={(value) => {
          onUbicacionActualChange(value === 'todos' ? undefined : value);
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Ubicación" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas</SelectItem>
          <SelectItem value="ALMACEN">Almacén</SelectItem>
          <SelectItem value="TIENDA">Tienda</SelectItem>
          <SelectItem value="PERSONA">Persona</SelectItem>
          <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro por tipo de propiedad */}
      <Select
        value={tipoPropiedad || 'todos'}
        onValueChange={(value) => {
          onTipoPropiedadChange(value === 'todos' ? undefined : value);
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Propiedad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="PROPIO">Propio</SelectItem>
          <SelectItem value="ALQUILADO">Alquilado</SelectItem>
        </SelectContent>
      </Select>

      {/* Ordenar por */}
      <Select value={ordenarPor} onValueChange={onOrdenarPorChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="e.fecha_creacion">Fecha Creación</SelectItem>
          <SelectItem value="e.inv_entel">Inv. Entel</SelectItem>
          <SelectItem value="e.numero_serie">Número Serie</SelectItem>
          <SelectItem value="e.estado_actual">Estado</SelectItem>
          <SelectItem value="e.ubicacion_actual">Ubicación</SelectItem>
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