import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, Clock, XCircle, AlertCircle, ClipboardCheck, Pencil } from 'lucide-react';
import { Movimiento } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getTipoMovimientoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    INGRESO_ALMACEN: 'Ingreso a Almacén',
    SALIDA_ASIGNACION: 'Asignación',
    SALIDA_REEMPLAZO: 'Reemplazo',
    SALIDA_PRESTAMO: 'Préstamo',
    RETORNO_TIENDA: 'Retorno de Tienda',
    RETORNO_PERSONA: 'Retorno de Persona',
    TRANSFERENCIA_TIENDAS: 'Transferencia',
    CAMBIO_ESTADO: 'Cambio de Estado',
  };
  return labels[tipo] || tipo;
};

export const columnsMovimientos: ColumnDef<Movimiento>[] = [
  {
    id: 'subcategoria',
    accessorKey: 'equipo_modelo',
    header: 'Equipo',
    size: 130,
    cell: ({ row }) => (
      <div className="text-xs">
        <div className="font-semibold truncate max-w-[130px]" title={row.original.equipo_modelo}>
          {row.original.equipo_modelo || '-'}
        </div>
      </div>
    ),
  },
  {
    id: 'marca',
    accessorKey: 'equipo_marca',
    header: 'Marca',
    size: 90,
    cell: ({ row }) => (
      <span className="text-xs font-medium truncate block max-w-[90px]" title={row.original.equipo_marca}>
        {row.original.equipo_marca || '-'}
      </span>
    ),
  },
  {
    id: 'numero_serie',
    accessorKey: 'equipo_serie',
    header: 'Serie',
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-xs truncate block max-w-[110px]" title={row.original.equipo_serie}>
        {row.original.equipo_serie || '-'}
      </span>
    ),
  },
  {
    id: 'inv_entel',
    accessorKey: 'equipo_inv_entel',
    header: 'Inv. Entel',
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-primary truncate block max-w-[110px]" title={row.original.equipo_inv_entel}>
        {row.original.equipo_inv_entel || '-'}
      </span>
    ),
  },
  {
    id: 'tipo_movimiento',
    accessorKey: 'tipo_movimiento',
    header: 'Tipo',
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs">
        {getTipoMovimientoLabel(row.original.tipo_movimiento)}
      </span>
    ),
  },
  {
    id: 'origen',
    accessorKey: 'ubicacion_origen',
    header: 'Origen',
    size: 130,
    cell: ({ row }) => {
      const { ubicacion_origen, tienda_origen_nombre, persona_origen } = row.original;
      let texto: string = ubicacion_origen;
      
      if (ubicacion_origen === 'TIENDA' && tienda_origen_nombre) {
        texto = tienda_origen_nombre;
      } else if (ubicacion_origen === 'PERSONA' && persona_origen) {
        texto = persona_origen;
      }

      return (
        <div className="text-xs">
          <div className="font-medium truncate max-w-[130px]" title={texto}>
            {texto}
          </div>
        </div>
      );
    },
  },
  {
    id: 'destino',
    accessorKey: 'ubicacion_destino',
    header: 'Destino',
    size: 130,
    cell: ({ row }) => {
      const { ubicacion_destino, tienda_destino_nombre, persona_destino } = row.original;
      let texto: string = ubicacion_destino;
      
      if (ubicacion_destino === 'TIENDA' && tienda_destino_nombre) {
        texto = tienda_destino_nombre;
      } else if (ubicacion_destino === 'PERSONA' && persona_destino) {
        texto = persona_destino;
      }

      return (
        <div className="text-xs">
          <div className="font-medium truncate max-w-[130px]" title={texto}>
            {texto}
          </div>
        </div>
      );
    },
  },
  {
    id: 'estado_movimiento',
    accessorKey: 'estado_movimiento',
    header: 'Estado',
    size: 110,
    cell: ({ row }) => {
      const estado = row.original.estado_movimiento;
      const estadoConfig: Record<string, { icon: any; color: string; text: string }> = {
        COMPLETADO: { icon: CheckCircle, color: 'bg-green-500', text: 'Completado' },
        EN_TRANSITO: { icon: Clock, color: 'bg-blue-500', text: 'En Tránsito' },
        PENDIENTE: { icon: AlertCircle, color: 'bg-yellow-500', text: 'Pendiente' },
        CANCELADO: { icon: XCircle, color: 'bg-red-500', text: 'Cancelado' },
      };

      const config = estadoConfig[estado] || estadoConfig.PENDIENTE;
      const Icon = config.icon;

      return (
        <Badge className={`${config.color} text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit`}>
          <Icon className="h-3 w-3" />
          {config.text}
        </Badge>
      );
    },
  },
  {
    id: 'codigo_acta',
    accessorKey: 'codigo_acta',
    header: 'Acta',
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">
        {row.original.codigo_acta || '-'}
      </span>
    ),
  },
  {
    id: 'fecha_salida',
    accessorKey: 'fecha_salida',
    header: 'Fecha Salida',
    size: 100,
    cell: ({ row }) => {
      const fecha = new Date(row.original.fecha_salida);
      return (
        <div className="text-xs">
          <div>{format(fecha, 'dd/MM/yyyy', { locale: es })}</div>
          <div className="text-[10px] text-gray-500">
            {format(fecha, 'HH:mm', { locale: es })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'usuario',
    accessorKey: 'usuario_nombre',
    header: 'Usuario',
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs truncate block max-w-[120px]" title={row.original.usuario_nombre}>
        {row.original.usuario_nombre || '-'}
      </span>
    ),
  },
  {
    id: 'acciones',
    header: 'Acciones',
    size: 120,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as {
        onView?: (movimiento: Movimiento) => void;
        onEdit?: (movimiento: Movimiento) => void;
        onConfirmarRecepcion?: (movimiento: Movimiento) => void;
      };

      const esEnTransito = item.estado_movimiento === 'EN_TRANSITO';
      const esCancelado = item.estado_movimiento === 'CANCELADO';

      return (
        <div className="flex items-center gap-1">
          {/* Botón Ver Detalle */}
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

          {/* Botón Editar - No mostrar si está cancelado */}
          {!esCancelado && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                if (meta?.onEdit) {
                  meta.onEdit(item);
                }
              }}
              className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
              title="Editar Movimiento"
              type="button"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Botón Confirmar Recepción - Solo si está EN_TRANSITO */}
          {esEnTransito && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                if (meta?.onConfirmarRecepcion) {
                  meta.onConfirmarRecepcion(item);
                }
              }}
              className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
              title="Confirmar Recepción"
              type="button"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    },
  },
];