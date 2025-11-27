import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  RowSelectionState,
  OnChangeFn,
} from '@tanstack/react-table';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onViewEquipos?: (row: TData) => void;
  meta?: Record<string, any>;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData) => string; // ← NUEVO
}

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  onEdit,
  onDelete,
  onViewEquipos,
  meta: customMeta,
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  getRowId, // ← NUEVO
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection,
    getRowId, // ← NUEVO: Usar IDs reales
    state: {
      rowSelection,
    },
    onRowSelectionChange,
    meta: {
      onEdit: onEdit,
      onDelete: onDelete,
      onViewEquipos: onViewEquipos,
      ...customMeta,
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="h-full overflow-auto">
        <table className="w-full border-collapse">
          {/* HEADER FIJO */}
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b-2 border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="font-semibold text-gray-700 text-xs py-3 px-3 text-left whitespace-nowrap bg-gray-50"
                    style={{ 
                      minWidth: header.getSize() !== 150 ? header.getSize() : 'auto',
                      width: header.getSize() !== 150 ? header.getSize() : 'auto' 
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* BODY */}
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    hover:bg-blue-50 transition-colors border-b border-gray-100
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-2.5 px-3 text-sm"
                      style={{ 
                        minWidth: cell.column.getSize() !== 150 ? cell.column.getSize() : 'auto',
                        width: cell.column.getSize() !== 150 ? cell.column.getSize() : 'auto'
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center text-gray-500"
                >
                  No hay resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}