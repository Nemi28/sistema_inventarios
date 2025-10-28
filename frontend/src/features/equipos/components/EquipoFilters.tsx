import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ESTADOS_EQUIPO } from '../types';

interface EquipoFiltersProps {
  activo?: boolean;
  onActivoChange: (value?: boolean) => void;
  estado?: string;
  onEstadoChange: (value?: string) => void;
  ordenarPor: string;
  onOrdenarPorChange: (value: string) => void;
  orden: 'ASC' | 'DESC';
  onOrdenChange: (value: 'ASC' | 'DESC') => void;
}

export const EquipoFilters = ({
  activo,
  onActivoChange,
  estado,
  onEstadoChange,
  ordenarPor,
  onOrdenarPorChange,
  orden,
  onOrdenChange,
}: EquipoFiltersProps) => {
  const getActivoLabel = () => {
    if (activo === undefined) return 'Todos';
    return activo ? 'Activos' : 'Inactivos';
  };

  const getEstadoLabel = () => {
    if (!estado) return 'Todos';
    return ESTADOS_EQUIPO.find((e) => e.value === estado)?.label || 'Todos';
  };

  const getOrdenarLabel = () => {
    const labels: Record<string, string> = {
      fecha_creacion: 'Fecha',
      nombre: 'Nombre',
      marca: 'Marca',
      modelo: 'Modelo',
      estado: 'Estado',
    };
    return labels[ordenarPor] || 'Fecha';
  };

  return (
    <div className="flex gap-2">
      {/* Filtro de Estado Activo/Inactivo */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {getActivoLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Estado</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={
              activo === undefined ? 'todos' : activo ? 'activos' : 'inactivos'
            }
            onValueChange={(value) => {
              if (value === 'todos') onActivoChange(undefined);
              else if (value === 'activos') onActivoChange(true);
              else onActivoChange(false);
            }}
          >
            <DropdownMenuRadioItem value="todos">Todos</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="activos">
              Activos
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="inactivos">
              Inactivos
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filtro de Estado del Equipo */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {getEstadoLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Estado del Equipo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={estado || 'todos'}
            onValueChange={(value) => {
              onEstadoChange(value === 'todos' ? undefined : value);
            }}
          >
            <DropdownMenuRadioItem value="todos">Todos</DropdownMenuRadioItem>
            {ESTADOS_EQUIPO.map((e) => (
              <DropdownMenuRadioItem key={e.value} value={e.value}>
                {e.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ordenar por */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {getOrdenarLabel()} ({orden === 'ASC' ? '↑' : '↓'})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={ordenarPor}
            onValueChange={onOrdenarPorChange}
          >
            <DropdownMenuRadioItem value="fecha_creacion">
              Fecha de Creación
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="nombre">Nombre</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="marca">Marca</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="modelo">Modelo</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="estado">Estado</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Dirección</DropdownMenuLabel>
          <DropdownMenuRadioGroup 
            value={orden} 
            onValueChange={(value) => {
              if (value === 'ASC' || value === 'DESC') {
                onOrdenChange(value);
              }
            }}
          >
            <DropdownMenuRadioItem value="ASC">
              Ascendente ↑
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="DESC">
              Descendente ↓
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};