import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, History, Eye, SlidersHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Equipo } from '../types';

export const columnsAlmacen: ColumnDef<Equipo>[] = [
  // Checkbox
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    size: 40,
  },
  {
    id: 'categoria',
    accessorKey: 'categoria_nombre',
    header: 'Categoría',
    size: 100,
    cell: ({ row }) => (
      <span className="text-xs font-medium truncate block max-w-[100px]" title={row.original.categoria_nombre}>
        {row.original.categoria_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'subcategoria',
    accessorKey: 'subcategoria_nombre',
    header: 'Subcategoría',
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs truncate block max-w-[120px]" title={row.original.subcategoria_nombre}>
        {row.original.subcategoria_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'marca',
    accessorKey: 'marca_nombre',
    header: 'Marca',
    size: 90,
    cell: ({ row }) => (
      <span className="text-xs font-medium truncate block max-w-[90px]" title={row.original.marca_nombre}>
        {row.original.marca_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'modelo',
    accessorKey: 'modelo_nombre',
    header: 'Modelo',
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs font-semibold truncate block max-w-[120px]" title={row.original.modelo_nombre}>
        {row.original.modelo_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'numero_serie',
    accessorKey: 'numero_serie',
    header: 'Serie',
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-xs truncate block max-w-[110px]" title={row.original.numero_serie}>
        {row.original.numero_serie || '-'}
      </span>
    ),
  },
  {
    id: 'inv_entel',
    accessorKey: 'inv_entel',
    header: 'Inv. Entel',
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-primary truncate block max-w-[110px]" title={row.original.inv_entel}>
        {row.original.inv_entel || '-'}
      </span>
    ),
  },
  {
    id: 'ultima_ubicacion',
    accessorKey: 'ultima_ubicacion_origen',
    header: 'Última Ubicación',
    size: 150,
    cell: ({ row }) => {
      const ubicacion = row.original.ultima_ubicacion_origen;
      if (!ubicacion) {
        return <span className="text-xs text-gray-400 italic">Nuevo</span>;
      }
      return (
        <span className="text-xs text-gray-600 truncate block max-w-[150px]" title={ubicacion}>
          {ubicacion}
        </span>
      );
    },
  },
  {
    id: 'estado_actual',
    accessorKey: 'estado_actual',
    header: 'Estado',
    size: 110,
    cell: ({ row }) => {
      const estado = row.original.estado_actual;
      const estadoMap: Record<string, { color: string; text: string }> = {
        OPERATIVO: { color: 'bg-green-500', text: 'Operativo' },
        POR_VALIDAR: { color: 'bg-yellow-500', text: 'Validar' },
        EN_GARANTIA: { color: 'bg-blue-500', text: 'Garantía' },
        INOPERATIVO: { color: 'bg-red-500', text: 'Inoperativo' },
        BAJA: { color: 'bg-gray-500', text: 'Baja' },
      };
      
      return (
        <Badge className={`${estadoMap[estado]?.color || ''} text-[10px] px-2 py-0.5`}>
          {estadoMap[estado]?.text || estado}
        </Badge>
      );
    },
  },
  {
    id: 'observaciones',
    accessorKey: 'observaciones',
    header: 'Observaciones',
    size: 150,
    cell: ({ row }) => (
      <span className="text-xs text-gray-600 truncate block max-w-[150px]" title={row.original.observaciones || ''}>
        {row.original.observaciones || '-'}
      </span>
    ),
  },
  {
    id: 'acciones',
    header: 'Acciones',
    size: 150,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as {
        onView?: (equipo: Equipo) => void;
        onEdit?: (equipo: Equipo) => void;
        onEditRapido?: (equipo: Equipo) => void;
        onDelete?: (equipo: Equipo) => void;
        onViewHistory?: (equipo: Equipo) => void;
      };

      return (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.onView) {
                meta.onView(item);
              }
            }}
            className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600"
            title="Ver Detalle"
            type="button"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.onEditRapido) {
                meta.onEditRapido(item);
              }
            }}
            className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
            title="Edición Rápida"
            type="button"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.onEdit) {
                meta.onEdit(item);
              }
            }}
            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
            title="Editar Completo"
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.onViewHistory) {
                meta.onViewHistory(item);
              }
            }}
            className="h-7 w-7 p-0 hover:bg-indigo-50 hover:text-indigo-600"
            title="Historial"
            type="button"
          >
            <History className="h-3.5 w-3.5" />
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
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];