import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { OrdenCompra } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrdenesCompraColumnsProps {
  onEdit: (ordenCompra: OrdenCompra) => void;
  onDelete: (ordenCompra: OrdenCompra) => void;
  userRole?: string;
}

export const getOrdenesCompraColumns = ({
  onEdit,
  onDelete,
  userRole,
}: OrdenesCompraColumnsProps): ColumnDef<OrdenCompra>[] => {
  const canEdit = userRole === 'gestor' || userRole === 'administrador';
  const canDelete = userRole === 'administrador';

  return [
    {
      accessorKey: 'numero_orden',
      header: 'N° Orden',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('numero_orden')}</div>
      ),
    },
    {
      accessorKey: 'fecha_ingreso',
      header: 'Fecha de Ingreso',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_ingreso') as string;
        return (
          <span className="text-sm">
            {format(new Date(fecha), 'dd/MM/yyyy', { locale: es })}
          </span>
        );
      },
    },
    {
      accessorKey: 'detalle',
      header: 'Detalle',
      cell: ({ row }) => {
        const detalle = row.getValue('detalle') as string | null;
        return detalle ? (
          <span className="text-sm line-clamp-1">{detalle}</span>
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
        const ordenCompra = row.original;

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
              {canEdit && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(ordenCompra)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && ordenCompra.activo && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(ordenCompra)}
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
