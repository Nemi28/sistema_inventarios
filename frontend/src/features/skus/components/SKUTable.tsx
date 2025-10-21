import { Package } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { columns } from './columns';
import { SKU } from '../types';
import { PaginationInfo } from '@/types/api.types';

interface SKUTableProps {
  data: SKU[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (sku: SKU) => void;
  onDelete: (sku: SKU) => void;
}

export const SKUTable = ({
  data,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
}: SKUTableProps) => {
  // Configurar metadatos para las columnas
  const columnsWithMeta = columns.map((col) => ({
    ...col,
    meta: {
      onEdit,
      onDelete,
    },
  }));

  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No hay SKUs registrados"
        description="Comienza creando tu primer SKU para empezar a gestionar el inventario"
      />
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={data}
        columns={columnsWithMeta}
        isLoading={isLoading}
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