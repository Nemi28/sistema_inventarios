import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowLeft, History } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Equipo } from '../types';

export const columnsTiendas: ColumnDef<Equipo>[] = [
  // ✅ NUEVA COLUMNA: Checkbox
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
    size: 90,
    cell: ({ row }) => (
      <span className="text-xs font-medium truncate block max-w-[90px]" title={row.original.categoria_nombre}>
        {row.original.categoria_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'subcategoria',
    accessorKey: 'subcategoria_nombre',
    header: 'Subcategoría',
    size: 110,
    cell: ({ row }) => (
      <span className="text-xs truncate block max-w-[110px]" title={row.original.subcategoria_nombre}>
        {row.original.subcategoria_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'marca',
    accessorKey: 'marca_nombre',
    header: 'Marca',
    size: 80,
    cell: ({ row }) => (
      <span className="text-xs font-medium truncate block max-w-[80px]" title={row.original.marca_nombre}>
        {row.original.marca_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'modelo',
    accessorKey: 'modelo_nombre',
    header: 'Modelo',
    size: 110,
    cell: ({ row }) => (
      <span className="text-xs font-semibold truncate block max-w-[110px]" title={row.original.modelo_nombre}>
        {row.original.modelo_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'numero_serie',
    accessorKey: 'numero_serie',
    header: 'Serie',
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-xs truncate block max-w-[100px]" title={row.original.numero_serie}>
        {row.original.numero_serie || '-'}
      </span>
    ),
  },
  {
    id: 'inv_entel',
    accessorKey: 'inv_entel',
    header: 'Inv. Entel',
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-primary truncate block max-w-[100px]" title={row.original.inv_entel}>
        {row.original.inv_entel || '-'}
      </span>
    ),
  },
  {
    id: 'tienda',
    accessorKey: 'nombre_tienda',
    header: 'Tienda',
    size: 130,
    cell: ({ row }) => {
      const { nombre_tienda, pdv } = row.original;
      return (
        <div className="text-xs">
          <div className="font-semibold truncate max-w-[130px]" title={nombre_tienda}>
            {nombre_tienda || '-'}
          </div>
          {pdv && <div className="text-[10px] text-gray-500">{pdv}</div>}
        </div>
      );
    },
  },
  {
    id: 'hostname',
    accessorKey: 'hostname',
    header: 'Hostname',
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-xs truncate block max-w-[110px]" title={row.original.hostname}>
        {row.original.hostname || '-'}
      </span>
    ),
  },
  {
    id: 'posicion',
    accessorKey: 'posicion_tienda',
    header: 'Posición',
    size: 80,
    cell: ({ row }) => (
      <span className="text-xs truncate block max-w-[80px]" title={row.original.posicion_tienda}>
        {row.original.posicion_tienda || '-'}
      </span>
    ),
  },
  {
    id: 'area',
    accessorKey: 'area_tienda',
    header: 'Área',
    size: 90,
    cell: ({ row }) => (
      <span className="text-xs truncate block max-w-[90px]" title={row.original.area_tienda}>
        {row.original.area_tienda || '-'}
      </span>
    ),
  },
  {
    id: 'estado_actual',
    accessorKey: 'estado_actual',
    header: 'Estado',
    size: 100,
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
    id: 'acciones',
    header: 'Acciones',
    size: 100,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as any;

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
            className="h-6 w-6 p-0 hover:bg-purple-50 hover:text-purple-600"
            title="Ver Detalle"
            type="button"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Retornar a almacén
            }}
            className="h-6 w-6 p-0 hover:bg-orange-50 hover:text-orange-600"
            title="Retornar a Almacén"
            type="button"
          >
            <ArrowLeft className="h-3 w-3" />
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
            className="h-6 w-6 p-0 hover:bg-gray-50 hover:text-gray-600"
            title="Historial"
            type="button"
          >
            <History className="h-3 w-3" />
          </Button>
        </div>
      );
    },
  },
];