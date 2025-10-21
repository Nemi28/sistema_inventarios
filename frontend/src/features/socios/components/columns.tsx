import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const item = row.original;
    const meta = table.options.meta as any;

    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            meta?.onEdit(item);
          }}
          className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            meta?.onDelete?.(item);
          }}
          className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white"
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  },
}
];