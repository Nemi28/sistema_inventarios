import { Store } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { TiendaTableSkeleton } from './TiendaTableSkeleton';
import { columns } from './columns';
import { Tienda } from '../types';
import { PaginationInfo } from '@/types/api.types';

interface TiendaTableProps {
  data: Tienda[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (tienda: Tienda) => void;
  onDelete: (tienda: Tienda) => void;
}

export const TiendaTable = ({
  data,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
}: TiendaTableProps) => {
  if (isLoading) {
    return <TiendaTableSkeleton />;
  }

  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No hay Tiendas registradas"
        description="Comienza creando tu primera tienda"
      />
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {pagination && pagination.total_paginas > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.total_paginas}
          onPageChange={onPageChange}
          totalItems={pagination.total}
          itemsPerPage={pagination.registros_por_pagina}
        />
      )}
    </div>
  );
};