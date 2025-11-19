import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Equipo } from '../types';

export const columns: ColumnDef<Equipo>[] = [
  {
    id: 'numero_serie',
    accessorKey: 'numero_serie',
    header: 'Serie',
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.numero_serie || '-'}
      </span>
    ),
  },
  {
    id: 'inv_entel',
    accessorKey: 'inv_entel',
    header: 'Inv. Entel',
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-primary">
        {row.original.inv_entel || '-'}
      </span>
    ),
  },
  {
    id: 'equipo',
    header: 'Equipo',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm">
          {row.original.modelo_nombre}
        </div>
        <div className="text-xs text-gray-500">
          {row.original.marca_nombre} • {row.original.categoria_nombre}
        </div>
      </div>
    ),
  },
  {
    id: 'tipo_propiedad',
    accessorKey: 'tipo_propiedad',
    header: 'Propiedad',
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className={row.original.tipo_propiedad === 'PROPIO' ? 'border-blue-500 text-blue-700' : 'border-orange-500 text-orange-700'}
      >
        {row.original.tipo_propiedad}
      </Badge>
    ),
  },
  {
    id: 'estado_actual',
    accessorKey: 'estado_actual',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.original.estado_actual;
      const colorMap: Record<string, string> = {
        OPERATIVO: 'bg-green-500 hover:bg-green-600',
        POR_VALIDAR: 'bg-yellow-500 hover:bg-yellow-600',
        EN_GARANTIA: 'bg-blue-500 hover:bg-blue-600',
        INOPERATIVO: 'bg-red-500 hover:bg-red-600',
        BAJA: 'bg-gray-500 hover:bg-gray-600',
      };
      
      return (
        <Badge className={colorMap[estado] || ''}>
          {estado}
        </Badge>
      );
    },
  },
  {
    id: 'ubicacion_actual',
    accessorKey: 'ubicacion_actual',
    header: 'Ubicación',
    cell: ({ row }) => {
      const ubicacion = row.original.ubicacion_actual;
      const colorMap: Record<string, string> = {
        ALMACEN: 'bg-purple-500',
        TIENDA: 'bg-green-500',
        PERSONA: 'bg-blue-500',
        EN_TRANSITO: 'bg-orange-500',
      };
      
      return (
        <div>
          <Badge className={colorMap[ubicacion] || ''}>
            {ubicacion}
          </Badge>
          {row.original.tienda_nombre && (
            <div className="text-xs text-gray-500 mt-1">
              {row.original.tienda_nombre}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'garantia',
    accessorKey: 'garantia',
    header: 'Garantía',
    cell: ({ row }) => (
      <Badge variant={row.original.garantia ? 'default' : 'secondary'}>
        {row.original.garantia ? '✓ Sí' : '✗ No'}
      </Badge>
    ),
  },
  {
    id: 'activo',
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge 
        variant={row.original.activo ? 'default' : 'destructive'}
        className={row.original.activo ? 'bg-green-500 hover:bg-green-600' : ''}
      >
        {row.original.activo ? '✅ Activo' : '❌ Inactivo'}
      </Badge>
    ),
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
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.onEdit) {
                meta.onEdit(item);
              }
            }}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            title="Editar"
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.onDelete) {
                meta.onDelete(item);
              }
            }}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];