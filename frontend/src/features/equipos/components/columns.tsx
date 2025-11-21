import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Equipo } from '../types';

export const columns: ColumnDef<Equipo>[] = [
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
    size: 100,
    cell: ({ row }) => (
      <span className="text-xs font-semibold truncate block max-w-[100px]" title={row.original.modelo_nombre}>
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
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-primary truncate block max-w-[90px]" title={row.original.inv_entel}>
        {row.original.inv_entel || '-'}
      </span>
    ),
  },
  {
    id: 'tipo_propiedad',
    accessorKey: 'tipo_propiedad',
    header: 'Propiedad',
    size: 90,
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className={`text-[10px] px-2 py-0.5 ${row.original.tipo_propiedad === 'PROPIO' ? 'border-blue-500 text-blue-700' : 'border-orange-500 text-orange-700'}`}
      >
        {row.original.tipo_propiedad === 'PROPIO' ? 'Propio' : 'Alquilado'}
      </Badge>
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
    id: 'ubicacion_actual',
    accessorKey: 'ubicacion_actual',
    header: 'Ubicación',
    size: 100,
    cell: ({ row }) => {
      const ubicacion = row.original.ubicacion_actual;
      const ubicacionMap: Record<string, { color: string; text: string }> = {
        ALMACEN: { color: 'bg-purple-500', text: 'Almacén' },
        TIENDA: { color: 'bg-green-500', text: 'Tienda' },
        PERSONA: { color: 'bg-blue-500', text: 'Persona' },
        EN_TRANSITO: { color: 'bg-orange-500', text: 'Tránsito' },
      };
      
      return (
        <div className="space-y-0.5">
          <Badge className={`${ubicacionMap[ubicacion]?.color || ''} text-[10px] px-2 py-0.5`}>
            {ubicacionMap[ubicacion]?.text || ubicacion}
          </Badge>
          {row.original.tienda_nombre && (
            <div className="text-[10px] text-gray-500 truncate max-w-[100px]" title={row.original.tienda_nombre}>
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
    size: 70,
    cell: ({ row }) => (
      <Badge 
        variant={row.original.garantia ? 'default' : 'secondary'}
        className="text-[10px] px-2 py-0.5"
      >
        {row.original.garantia ? 'Sí' : 'No'}
      </Badge>
    ),
  },
  {
    id: 'acciones',
    header: 'Acciones',
    size: 80,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as any;

      return (
        <div className="flex items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (meta?.onEdit) {
                meta.onEdit(item);
              }
            }}
            className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
            title="Editar"
            type="button"
          >
            <Pencil className="h-3 w-3" />
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
            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      );
    },
  },
];