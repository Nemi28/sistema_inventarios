import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useCategoria } from '../hooks/useCategoria';
import { SubcategoriasTab } from './tabs/SubcategoriasTab';
import { MarcasTab } from '@/features/marcas/components/MarcasTab';
import { ModelosTab } from '@/features/modelos/components/ModelosTab';

type TabType = 'subcategorias' | 'marcas' | 'modelos';

export const CategoriaDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const categoriaId = parseInt(id || '0');

  const { data: categoria, isLoading } = useCategoria(categoriaId, categoriaId > 0);
  const [activeTab, setActiveTab] = useState<TabType>('subcategorias');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!categoria) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Categoría no encontrada</p>
      </div>
    );
  }

  const tabs = [
    { id: 'subcategorias', label: 'Subcategorías' },
    { id: 'marcas', label: 'Marcas' },
    { id: 'modelos', label: 'Modelos' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header con breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/categorias')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Volver a Categorías</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span 
          onClick={() => navigate('/categorias')}
          className="hover:text-blue-600 cursor-pointer"
        >
          Categorías
        </span>
        <span>/</span>
        <span className="font-medium text-gray-900">{categoria.nombre}</span>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Equipos - {categoria.nombre}
        </h1>
        <p className="text-gray-600 mt-1">
          Administra subcategorías, marcas y modelos de equipos
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'subcategorias' && (
          <SubcategoriasTab categoriaId={categoriaId} />
        )}
        {activeTab === 'marcas' && (
          <MarcasTab />
        )}
        {activeTab === 'modelos' && (
          <ModelosTab categoriaId={categoriaId} />
        )}
      </div>
    </div>
  );
};