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
import { SKU } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const columns: ColumnDef<SKU>[] = [
  {
    accessorKey: 'codigo_sku',
    header: 'Código SKU',
    cell: ({ row }) => (
      <span className="font-mono font-medium text-sm">
        {row.getValue('codigo_sku')}
      </span>
    ),
  },
  {
    accessorKey: 'descripcion_sku',
    header: 'Descripción',
    cell: ({ row }) => {
      const desc = row.getValue('descripcion_sku') as string;
      return (
        <span 
          className="max-w-[300px] truncate block" 
          title={desc}
        >
          {desc}
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
      const sku = row.original;
      const meta = table.options.meta as any;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => meta?.onEdit(sku)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.onDelete?.(sku)}
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