import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    const item = row.original;
    const meta = table.options.meta as any;

    console.log('🔍 Renderizando acciones');
    console.log('Item:', item);
    console.log('Meta:', meta);
    console.log('onEdit existe?', typeof meta?.onEdit);
    console.log('onDelete existe?', typeof meta?.onDelete);

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            console.log('🔵 CLICK EN EDITAR');
            e.stopPropagation();
            if (meta?.onEdit) {
              console.log('✅ Llamando onEdit');
              meta.onEdit(item);
            } else {
              console.log('❌ onEdit no existe');
            }
          }}
          className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center transition-colors"
          title="Editar"
          type="button"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            console.log('🔴 CLICK EN ELIMINAR');
            e.stopPropagation();
            if (meta?.onDelete) {
              console.log('✅ Llamando onDelete');
              meta.onDelete(item);
            } else {
              console.log('❌ onDelete no existe');
            }
          }}
          className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors"
          title="Eliminar"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  },
}
];