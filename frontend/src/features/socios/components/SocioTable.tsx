import { Building2 } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { columns } from './columns';
import { Socio } from '../types';
import { PaginationInfo } from '@/types/api.types';

interface SocioTableProps {
  data: Socio[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (socio: Socio) => void;
  onDelete: (socio: Socio) => void;
}

export const SocioTable = ({
  data,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
}: SocioTableProps) => {
  // Configurar metadatos para las columnas
 //onst columnsWithMeta = columns.map((col) => ({
  //...col,
   //eta: {
    //onEdit,
   // onDelete,
  //},
 //));

  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No hay Socios registrados"
        description="Comienza creando tu primer Socio de negocio"
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