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
import { getOrdenesCompraColumns } from './OrdenesCompraColumns';
import { OrdenesCompraSkeleton } from './OrdenesCompraSkeleton';
import { OrdenCompra } from '../types';
import { PaginationInfo } from '@/types/api.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrdenesCompraTableProps {
  data: OrdenCompra[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (ordenCompra: OrdenCompra) => void;
  onDelete: (ordenCompra: OrdenCompra) => void;
  userRole?: string;
}

export const OrdenesCompraTable = ({
  data,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  userRole,
}: OrdenesCompraTableProps) => {
  const columns = getOrdenesCompraColumns({
    onEdit,
    onDelete,
    userRole,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <OrdenesCompraSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              No se encontraron órdenes de compra
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Intenta ajustar los filtros o crear una nueva orden
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
        {data.map((ordenCompra) => (
          <div
            key={ordenCompra.id}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-lg">{ordenCompra.numero_orden}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(ordenCompra.fecha_ingreso), 'dd/MM/yyyy', {
                    locale: es,
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                {(userRole === 'gestor' || userRole === 'administrador') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(ordenCompra)}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </div>
            {ordenCompra.detalle && (
              <div>
                <p className="text-sm text-gray-500">Detalle:</p>
                <p className="text-sm">{ordenCompra.detalle}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.total_paginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * pagination.registros_por_pagina + 1} a{' '}
            {Math.min(
              currentPage * pagination.registros_por_pagina,
              pagination.total
            )}{' '}
            de {pagination.total} órdenes
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
