import { FolderOpen } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { columns } from './columns';
import { Categoria } from '../types';
import { PaginationInfo } from '@/types/api.types';

interface CategoriaTableProps {
  data: Categoria[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}

export const CategoriaTable = ({
  data,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
}: CategoriaTableProps) => {
  // Configurar metadatos para las columnas

 //onst columnsWithMeta = columns.map((col) => ({
   //..col,
   //eta: {
     //nEdit,
     //nDelete,
   //,
 //));

  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No hay categorías registradas"
        description="Comienza creando tu primera categoría para organizar tu inventario"
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