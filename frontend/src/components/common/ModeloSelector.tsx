import { useQuery } from '@tanstack/react-query';
import { obtenerCategorias } from '@/features/categorias/services/categorias.service';
import { obtenerSubcategoriasPorCategoria } from '@/features/subcategorias/services/subcategorias.service';
import { obtenerMarcasPorSubcategoria } from '@/features/marcas/services/marcas.service';
import { obtenerModelosPorMarcaYSubcategoria } from '@/features/modelos/services/modelos.service';

interface ModeloSelectorValue {
  categoria_id: number;
  subcategoria_id: number;
  marca_id: number;
  modelo_id: number;
}

interface ModeloSelectorResult extends ModeloSelectorValue {
  categoria_nombre?: string;
  subcategoria_nombre?: string;
  marca_nombre?: string;
  modelo_nombre?: string;
}

interface ModeloSelectorProps {
  value: ModeloSelectorValue;
  onChange: (value: ModeloSelectorResult) => void;
  disabled?: boolean;
  errors?: {
    categoria_id?: string;
    subcategoria_id?: string;
    marca_id?: string;
    modelo_id?: string;
  };
  labels?: {
    categoria?: string;
    subcategoria?: string;
    marca?: string;
    modelo?: string;
  };
  required?: boolean;
}

export const ModeloSelector: React.FC<ModeloSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  errors,
  labels = {
    categoria: 'Categoría',
    subcategoria: 'Subcategoría',
    marca: 'Marca',
    modelo: 'Modelo',
  },
  required = true,
}) => {
  // Queries para combos escalonados
  const { data: categorias, isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: obtenerCategorias,
  });

  const { data: subcategorias, isLoading: loadingSubcategorias } = useQuery({
    queryKey: ['subcategorias', 'categoria', value.categoria_id],
    queryFn: () => obtenerSubcategoriasPorCategoria(value.categoria_id),
    enabled: value.categoria_id > 0,
  });

  const { data: marcas, isLoading: loadingMarcas } = useQuery({
    queryKey: ['marcas', 'subcategoria', value.subcategoria_id],
    queryFn: () => obtenerMarcasPorSubcategoria(value.subcategoria_id),
    enabled: value.subcategoria_id > 0,
  });

  const { data: modelos, isLoading: loadingModelos } = useQuery({
    queryKey: ['modelos', 'marca-subcategoria', value.marca_id, value.subcategoria_id],
    queryFn: () => obtenerModelosPorMarcaYSubcategoria(value.marca_id, value.subcategoria_id),
    enabled: value.marca_id > 0 && value.subcategoria_id > 0,
  });

  // Handlers
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoriaId = parseInt(e.target.value);
    const categoria = categorias?.find((c) => c.id === newCategoriaId);

    onChange({
      categoria_id: newCategoriaId,
      subcategoria_id: 0,
      marca_id: 0,
      modelo_id: 0,
      categoria_nombre: categoria?.nombre,
      subcategoria_nombre: '',
      marca_nombre: '',
      modelo_nombre: '',
    });
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubcategoriaId = parseInt(e.target.value);
    const subcategoria = subcategorias?.find((s) => s.id === newSubcategoriaId);

    onChange({
      ...value,
      subcategoria_id: newSubcategoriaId,
      marca_id: 0,
      modelo_id: 0,
      subcategoria_nombre: subcategoria?.nombre,
      marca_nombre: '',
      modelo_nombre: '',
    });
  };

  const handleMarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMarcaId = parseInt(e.target.value);
    const marca = marcas?.find((m) => m.id === newMarcaId);

    onChange({
      ...value,
      marca_id: newMarcaId,
      modelo_id: 0,
      marca_nombre: marca?.nombre,
      modelo_nombre: '',
    });
  };

  const handleModeloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModeloId = parseInt(e.target.value);
    const modelo = modelos?.find((m) => m.id === newModeloId);

    onChange({
      ...value,
      modelo_id: newModeloId,
      modelo_nombre: modelo?.nombre,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {labels.categoria} {required && '*'}
        </label>
        <select
          value={value.categoria_id || ''}
          onChange={handleCategoriaChange}
          disabled={disabled || loadingCategorias}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar...</option>
          {categorias?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        {errors?.categoria_id && (
          <p className="mt-1 text-sm text-red-600">{errors.categoria_id}</p>
        )}
      </div>

      {/* Subcategoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {labels.subcategoria} {required && '*'}
        </label>
        <select
          value={value.subcategoria_id || ''}
          onChange={handleSubcategoriaChange}
          disabled={disabled || !value.categoria_id || loadingSubcategorias}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar...</option>
          {subcategorias?.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.nombre}
            </option>
          ))}
        </select>
        {errors?.subcategoria_id && (
          <p className="mt-1 text-sm text-red-600">{errors.subcategoria_id}</p>
        )}
      </div>

      {/* Marca */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {labels.marca} {required && '*'}
        </label>
        <select
          value={value.marca_id || ''}
          onChange={handleMarcaChange}
          disabled={disabled || !value.subcategoria_id || loadingMarcas}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar...</option>
          {marcas?.map((marca) => (
            <option key={marca.id} value={marca.id}>
              {marca.nombre}
            </option>
          ))}
        </select>
        {errors?.marca_id && (
          <p className="mt-1 text-sm text-red-600">{errors.marca_id}</p>
        )}
      </div>

      {/* Modelo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {labels.modelo} {required && '*'}
        </label>
        <select
          value={value.modelo_id || ''}
          onChange={handleModeloChange}
          disabled={disabled || !value.marca_id || !value.subcategoria_id || loadingModelos}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar...</option>
          {modelos?.map((modelo) => (
            <option key={modelo.id} value={modelo.id}>
              {modelo.nombre}
            </option>
          ))}
        </select>
        {errors?.modelo_id && (
          <p className="mt-1 text-sm text-red-600">{errors.modelo_id}</p>
        )}
      </div>
    </div>
  );
};