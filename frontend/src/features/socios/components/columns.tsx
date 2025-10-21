import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Socio } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const columns: ColumnDef<Socio>[] = [
  {
    accessorKey: 'razon_social',
    header: 'Razón Social',
    cell: ({ row }) => (
      <span className="font-medium text-sm">
        {row.getValue('razon_social')}
      </span>
    ),
  },
  {
    accessorKey: 'ruc',
    header: 'RUC',
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.getValue('ruc')}
      </span>
    ),
  },
  {
    accessorKey: 'direccion',
    header: 'Dirección',
    cell: ({ row }) => {
      const direccion = row.getValue('direccion') as string;
      return (
        <span 
          className="max-w-[250px] truncate block" 
          title={direccion}
        >
          {direccion}
        </span>
      );
    },
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => {
      const activo = row.getValue('activo') as boolean;
      return (
        <Badge className={activo ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'fecha_creacion',
    header: 'Fecha Creación',
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('fecha_creacion'));
      return (
        <span className="text-sm text-gray-600">
          {format(fecha, 'dd/MM/yyyy', { locale: es })}
        </span>
      );
    },
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row, table }) => {
      const socio = row.original;
      const meta = table.options.meta as any;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => meta?.onEdit(socio)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.onDelete?.(socio)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];