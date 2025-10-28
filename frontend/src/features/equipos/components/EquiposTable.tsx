import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEquiposColumns } from './EquiposColumns';
import { EquiposSkeleton } from './EquiposSkeleton';
import { Equipo } from '../types';
import { PaginationInfo } from '@/types/api.types';

interface EquiposTableProps {
  data: Equipo[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (equipo: Equipo) => void;
  onDelete: (equipo: Equipo) => void;
  onViewDetail: (equipo: Equipo) => void;
  userRole?: string;
}

export const EquiposTable = ({
  data,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  onViewDetail,
  userRole,
}: EquiposTableProps) => {
  const columns = getEquiposColumns({
    onEdit,
    onDelete,
    onViewDetail,
    userRole,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <EquiposSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              No se encontraron equipos
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Intenta ajustar los filtros o crear un nuevo equipo
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabla Desktop */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((equipo) => (
          <div
            key={equipo.id}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-lg">{equipo.nombre}</p>
                <p className="text-sm text-gray-500">
                  {equipo.marca} - {equipo.modelo}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(equipo)}
                >
                  Ver
                </Button>
                {(userRole === 'gestor' || userRole === 'administrador') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(equipo)}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Categoría:</p>
                <p className="font-medium">{equipo.categoria_nombre}</p>
              </div>
              <div>
                <p className="text-gray-500">Estado:</p>
                <p className="font-medium">{equipo.estado}</p>
              </div>
              {equipo.inv_entel && (
                <div>
                  <p className="text-gray-500">Inv ENTEL:</p>
                  <p className="font-medium">{equipo.inv_entel}</p>
                </div>
              )}
              {equipo.numero_serie && (
                <div>
                  <p className="text-gray-500">N° Serie:</p>
                  <p className="font-mono text-xs">{equipo.numero_serie}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.total_paginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * pagination.registros_por_pagina + 1} a{' '}
            {Math.min(currentPage * pagination.registros_por_pagina, pagination.total)} de{' '}
            {pagination.total} equipos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {pagination.total_paginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.total_paginas}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};