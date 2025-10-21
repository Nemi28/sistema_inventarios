import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({
  data,
  columns,
  isLoading,
  onRowClick,
}: DataTableProps<TData>) {
  const isMobile = useIsMobile();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Vista Mobile - Cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        {table.getRowModel().rows.map((row) => (
          <Card
            key={row.id}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onRowClick?.(row.original)}
          >
            <CardContent className="p-4">
              {row.getVisibleCells().map((cell) => {
                const columnDef = cell.column.columnDef;
                if (columnDef.id === 'acciones') {
                  return (
                    <div key={cell.id} className="mt-3 pt-3 border-t flex gap-2">
                      {flexRender(columnDef.cell, cell.getContext())}
                    </div>
                  );
                }
                return (
                  <div key={cell.id} className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-500">
                      {typeof columnDef.header === 'string' ? columnDef.header : ''}
                    </span>
                    <span className="text-sm text-gray-900">
                      {flexRender(columnDef.cell, cell.getContext())}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Vista Desktop - Tabla
  return (
    <div className="rounded-md border">
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}