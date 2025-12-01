import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Tienda } from '../types';

export const columns: ColumnDef<Tienda>[] = [
  {
    id: 'pdv',
    accessorKey: 'pdv',
    header: 'PDV',
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-primary">
        {row.original.pdv}
      </span>
    ),
  },
  {
    id: 'nombre_tienda',
    accessorKey: 'nombre_tienda',
    header: 'Nombre Tienda',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.nombre_tienda}
      </div>
    ),
  },
  {
    id: 'socio',
    header: 'Socio',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm">
          {row.original.socio_razon_social}
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {row.original.socio_ruc}
        </div>
      </div>
    ),
  },
  {
    id: 'perfil_local',
    accessorKey: 'perfil_local',
    header: 'Perfil',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">
        {row.original.perfil_local}
      </Badge>
    ),
  },
  {
    id: 'enlace',
    accessorKey: 'enlace',
    header: 'Enlace',
    cell: ({ row }) => (
      <Badge 
        variant={row.original.enlace === 'SI' ? 'default' : 'secondary'}
        className={row.original.enlace === 'SI' ? 'bg-blue-500' : ''}
      >
        {row.original.enlace || 'NO'}
      </Badge>
    ),
  },
  {
    id: 'responsables',
    header: 'Responsables',
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.responsable_socio && (
          <div className="text-gray-600">
            <span className="text-xs text-gray-400">Socio:</span> {row.original.responsable_socio}
          </div>
        )}
        {row.original.responsable_entel && (
          <div className="text-gray-600">
            <span className="text-xs text-gray-400">Entel:</span> {row.original.responsable_entel}
          </div>
        )}
        {!row.original.responsable_socio && !row.original.responsable_entel && (
          <span className="text-gray-400 text-xs">Sin asignar</span>
        )}
      </div>
    ),
  },
  {
    id: 'direccion',
    accessorKey: 'direccion',
    header: 'Dirección',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 line-clamp-1 max-w-[180px]">
        {row.original.direccion}
      </span>
    ),
  },
  {
    id: 'ubigeo',
    accessorKey: 'ubigeo',
    header: 'UBIGEO',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-gray-500">
        {row.original.ubigeo}
      </span>
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
        {row.original.activo ? 'Activo' : 'Inactivo'}
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