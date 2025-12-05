import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, History, Eye, SlidersHorizontal, Cpu } from 'lucide-react';
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
  id: 'equipo',
  header: 'Equipo',
  size: 200,
  cell: ({ row }) => {
    const { subcategoria_nombre, marca_nombre, modelo_nombre, categoria_nombre, accesorios_count } = row.original;
    return (
      <div className="text-xs">
        <div className="flex items-center gap-1">
          <span className="font-semibold truncate max-w-[170px]" title={modelo_nombre}>
            {modelo_nombre || '-'}
          </span>
          {(accesorios_count ?? 0) > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-full font-medium">
              {accesorios_count} acc
            </span>
          )}
        </div>
        <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
          {subcategoria_nombre || categoria_nombre} • {marca_nombre}
        </div>
      </div>
    );
  },
},
  {
    id: 'identificacion',
    header: 'Identificación',
    size: 130,
    cell: ({ row }) => {
      const { numero_serie, inv_entel } = row.original;
      return (
        <div className="text-xs font-mono">
          <div className="truncate max-w-[130px]" title={numero_serie}>
            {numero_serie || 'S/N'}
          </div>
          {inv_entel && inv_entel !== 'NULL' && (
            <div className="text-[10px] text-primary font-semibold">{inv_entel}</div>
          )}
        </div>
      );
    },
  },
  {
    id: 'ultima_ubicacion',
    accessorKey: 'ultima_ubicacion_origen',
    header: 'Última Ubicación',
    size: 140,
    cell: ({ row }) => {
      let ubicacion = row.original.ultima_ubicacion_origen;
      if (!ubicacion) {
        return <span className="text-xs text-gray-400 italic">Nuevo</span>;
      }
      // Quitar prefijos "Tienda: " y "Persona: "
      ubicacion = ubicacion.replace(/^(Tienda|Persona):\s*/i, '');
      return (
        <span className="text-xs text-gray-600 truncate block max-w-[140px]" title={ubicacion}>
          {ubicacion}
        </span>
      );
    },
  },
  {
    id: 'equipo_principal',
    accessorKey: 'equipo_principal_serie',
    header: 'Instalado en',
    size: 150,
    cell: ({ row }) => {
      const equipo = row.original;
      if (!equipo.equipo_principal_id) {
        return <span className="text-xs text-gray-400">-</span>;
      }
      return (
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-amber-500" />
          <span className="text-xs truncate block max-w-[130px]" title={`${equipo.equipo_principal_modelo} - ${equipo.equipo_principal_serie}`}>
            {equipo.equipo_principal_modelo} - {equipo.equipo_principal_serie || equipo.equipo_principal_inv_entel || 'S/N'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'estado_actual',
    accessorKey: 'estado_actual',
    header: 'Estado',
    size: 90,
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
    size: 130,
    cell: ({ row }) => (
      <span className="text-xs text-gray-600 truncate block max-w-[130px]" title={row.original.observaciones || ''}>
        {row.original.observaciones || '-'}
      </span>
    ),
  },
  {
    id: 'acciones',
    header: 'Acciones',
    size: 140,
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