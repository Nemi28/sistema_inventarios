import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowLeft, History, SlidersHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Equipo } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const columnsPersonas: ColumnDef<Equipo>[] = [
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
  size: 180,
  cell: ({ row }) => {
    const { subcategoria_nombre, marca_nombre, modelo_nombre, categoria_nombre, accesorios_count } = row.original;
    return (
      <div className="text-xs">
        <div className="flex items-center gap-1">
          <span className="font-semibold truncate max-w-[150px]" title={modelo_nombre}>
            {modelo_nombre || '-'}
          </span>
          {(accesorios_count ?? 0) > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-full font-medium">
              {accesorios_count} acc
            </span>
          )}
        </div>
        <div className="text-[10px] text-gray-500 truncate max-w-[180px]">
          {subcategoria_nombre || categoria_nombre} • {marca_nombre}
        </div>
      </div>
    );
  },
},
  {
    id: 'identificacion',
    header: 'Identificación',
    size: 120,
    cell: ({ row }) => {
      const { numero_serie, inv_entel } = row.original;
      return (
        <div className="text-xs font-mono">
          <div className="truncate max-w-[120px]" title={numero_serie}>
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
    id: 'asignado_a',
    accessorKey: 'persona_asignada',
    header: 'Asignado a',
    size: 150,
    cell: ({ row }) => {
      const { persona_asignada, fecha_asignacion } = row.original;
      return (
        <div className="text-xs">
          <div className="font-semibold truncate max-w-[150px]" title={persona_asignada}>
            {persona_asignada || '-'}
          </div>
          {fecha_asignacion && (
            <div className="text-[10px] text-gray-500">
              {format(new Date(fecha_asignacion), "dd/MM/yyyy", { locale: es })}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'procedencia',
    accessorKey: 'ultima_ubicacion_origen',
    header: 'Procedencia',
    size: 130,
    cell: ({ row }) => {
      let procedencia = row.original.ultima_ubicacion_origen || '-';
      // Quitar prefijos "Tienda: " y "Persona: "
      procedencia = procedencia.replace(/^(Tienda|Persona):\s*/i, '');
      return (
        <span className="text-xs text-gray-600 truncate block max-w-[130px]" title={procedencia}>
          {procedencia}
        </span>
      );
    },
  },
  {
    id: 'acta',
    accessorKey: 'codigo_acta',
    header: 'Acta',
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-xs truncate block max-w-[100px]" title={row.original.codigo_acta}>
        {row.original.codigo_acta || '-'}
      </span>
    ),
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
    id: 'acciones',
    header: 'Acciones',
    size: 110,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as {
        onView?: (equipo: Equipo) => void;
        onEditRapido?: (equipo: Equipo) => void;
        onRetornarAlmacen?: (equipo: Equipo) => void;
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
              if (meta?.onRetornarAlmacen) {
                meta.onRetornarAlmacen(item);
              }
            }}
            className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600"
            title="Retornar a Almacén"
            type="button"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
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
            className="h-7 w-7 p-0 hover:bg-gray-50 hover:text-gray-600"
            title="Historial"
            type="button"
          >
            <History className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];