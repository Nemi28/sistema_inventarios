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

interface OrdenCompraFiltersProps {
  activo?: boolean;
  onActivoChange: (value?: boolean) => void;
  ordenarPor: string;
  onOrdenarPorChange: (value: string) => void;
  orden: 'ASC' | 'DESC';
  onOrdenChange: (value: 'ASC' | 'DESC') => void;
}

export const OrdenCompraFilters = ({
  activo,
  onActivoChange,
  ordenarPor,
  onOrdenarPorChange,
  orden,
  onOrdenChange,
}: OrdenCompraFiltersProps) => {
  const getActivoLabel = () => {
    if (activo === undefined) return 'Todos';
    return activo ? 'Activos' : 'Inactivos';
  };

  const getOrdenarLabel = () => {
    const labels: Record<string, string> = {
      fecha_creacion: 'Fecha Creación',
      numero_orden: 'N° Orden',
      fecha_ingreso: 'Fecha Ingreso',
    };
    return labels[ordenarPor] || 'Fecha Creación';
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
            <DropdownMenuRadioItem value="numero_orden">
              N° de Orden
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="fecha_ingreso">
              Fecha de Ingreso
            </DropdownMenuRadioItem>
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