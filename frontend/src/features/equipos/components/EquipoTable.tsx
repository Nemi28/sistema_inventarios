import { Monitor } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { EquipoTableSkeleton } from './EquipoTableSkeleton';
import { columns } from './columns';
import { Equipo } from '../types';
import { PaginationInfo } from '@/types/api.types';

interface EquipoTableProps {
  data: Equipo[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (equipo: Equipo) => void;
  onDelete: (equipo: Equipo) => void;
}

export const EquipoTable = ({
  data,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
}: EquipoTableProps) => {
  if (isLoading) {
    return <EquipoTableSkeleton />;
  }

  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={Monitor}
        title="No hay Equipos registrados"
        description="Comienza creando tu primer equipo"
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