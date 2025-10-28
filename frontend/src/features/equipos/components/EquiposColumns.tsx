import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Equipo, ESTADOS_EQUIPO } from '../types';

interface EquiposColumnsProps {
  onEdit: (equipo: Equipo) => void;
  onDelete: (equipo: Equipo) => void;
  onViewDetail: (equipo: Equipo) => void;
  userRole?: string;
}

export const getEquiposColumns = ({
  onEdit,
  onDelete,
  onViewDetail,
  userRole,
}: EquiposColumnsProps): ColumnDef<Equipo>[] => {
  const canEdit = userRole === 'gestor' || userRole === 'administrador';
  const canDelete = userRole === 'administrador';

  return [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('nombre')}</div>
      ),
    },
    {
      accessorKey: 'marca',
      header: 'Marca',
    },
    {
      accessorKey: 'modelo',
      header: 'Modelo',
    },
    {
      accessorKey: 'categoria_nombre',
      header: 'Categoría',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('categoria_nombre')}</Badge>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string;
        const estadoConfig = ESTADOS_EQUIPO.find((e) => e.value === estado);
        return (
          <Badge
            className={`${estadoConfig?.color || 'bg-gray-100 text-gray-800'}`}
            variant="secondary"
          >
            {estadoConfig?.label || estado}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'inv_entel',
      header: 'Inv ENTEL',
      cell: ({ row }) => {
        const inv = row.getValue('inv_entel') as string | null;
        return inv ? (
          <span className="text-sm">{inv}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: 'numero_serie',
      header: 'N° Serie',
      cell: ({ row }) => {
        const serie = row.getValue('numero_serie') as string | null;
        return serie ? (
          <span className="text-sm font-mono">{serie}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => {
        const activo = row.getValue('activo') as boolean;
        return (
          <Badge variant={activo ? 'default' : 'secondary'}>
            {activo ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const equipo = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetail(equipo)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(equipo)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && equipo.activo && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(equipo)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};