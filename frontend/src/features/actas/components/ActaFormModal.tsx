import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch, UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useGenerarActa } from '../hooks/useGenerarActa';
import {
  GenerarActaFormData,
  TIPO_ATENCION_OPTIONS,
  AREAS_OPTIONS,
  CARGOS_OPTIONS,
  ING_SOPORTE_OPTIONS,
  ESTADO_EQUIPO_OPTIONS,
} from '../types';
import { useQuery } from '@tanstack/react-query';
import { obtenerCategorias } from '@/features/categorias/services/categorias.service';
import { obtenerSubcategoriasPorCategoria } from '@/features/subcategorias/services/subcategorias.service';
import { obtenerMarcasPorSubcategoria } from '@/features/marcas/services/marcas.service';
import { obtenerModelosPorMarcaYSubcategoria } from '@/features/modelos/services/modelos.service';
import { TiendaSelect } from './TiendaSelect';

const actaSchema = z.object({
  tipo_atencion: z.enum(['PRESTAMO', 'REEMPLAZO', 'ASIGNACION', 'UPGRADE']),
  usuario: z.string().min(1, 'El usuario es requerido'),
  ticket: z.string().min(1, 'El ticket es requerido'),
  email: z.string().email('Email inválido'),
  area: z.string().min(1, 'El área es requerida'),
  cargo: z.string().min(1, 'El cargo es requerido'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  local_id: z.number().min(1, 'El local es requerido'),
  jefe_responsable: z.string().email('Email inválido'),
  ing_soporte: z.string().min(1, 'El ingeniero de soporte es requerido'),
  equipos_entregados: z
    .array(
      z.object({
        categoria_id: z.number().min(1, 'Tipo de equipo requerido'),
        subcategoria_id: z.number().min(1, 'Equipo requerido'),
        marca_id: z.number().min(1, 'Marca requerida'),
        modelo_id: z.number().min(1, 'Modelo requerido'),
        equipo: z.string().min(1, 'Requerido'),
        marca: z.string().min(1, 'Requerido'),
        modelo: z.string().min(1, 'Requerido'),
        serie: z.string().min(1, 'Requerido'),
        inventario: z.string().min(1, 'Requerido'),
        hostname: z.string().optional(),
        procesador: z.string().optional(),
        disco: z.string().optional(),
        ram: z.string().optional(),
      })
    )
    .min(1, 'Debe haber al menos un equipo entregado'),
  observaciones_entregados: z.string().optional(),
  equipos_recojo: z
    .array(
      z.object({
        categoria_id: z.number().min(1, 'Tipo de equipo requerido'),
        subcategoria_id: z.number().min(1, 'Equipo requerido'),
        marca_id: z.number().min(1, 'Marca requerida'),
        modelo_id: z.number().min(1, 'Modelo requerido'),
        equipo: z.string().min(1, 'Requerido'),
        marca: z.string().min(1, 'Requerido'),
        modelo: z.string().min(1, 'Requerido'),
        serie: z.string().min(1, 'Requerido'),
        inventario: z.string().min(1, 'Requerido'),
        hostname: z.string().optional(),
        procesador: z.string().optional(),
        disco: z.string().optional(),
        ram: z.string().optional(),
        estado: z.enum(['OPERATIVO', 'INOPERATIVO', 'DAÑO FISICO', 'POR VALIDAR']),
      })
    )
    .optional(),
  observaciones_recojo: z.string().optional(),
});

interface ActaFormModalProps {
  open: boolean;
  onClose: () => void;
}

const ActaFormModal: React.FC<ActaFormModalProps> = ({ open, onClose }) => {
  const mutation = useGenerarActa();

  // Query para obtener categorías
  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: obtenerCategorias,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GenerarActaFormData>({
    resolver: zodResolver(actaSchema),
    defaultValues: {
      equipos_entregados: [
        {
          categoria_id: 0,
          subcategoria_id: 0,
          marca_id: 0,
          modelo_id: 0,
          equipo: '',
          marca: '',
          modelo: '',
          serie: '',
          inventario: '',
          hostname: '',
          procesador: '',
          disco: '',
          ram: '',
        },
      ],
      equipos_recojo: [],
    },
  });

  const {
    fields: fieldsEntregados,
    append: appendEntregado,
    remove: removeEntregado,
  } = useFieldArray({
    control,
    name: 'equipos_entregados',
  });

  const {
    fields: fieldsRecojo,
    append: appendRecojo,
    remove: removeRecojo,
  } = useFieldArray({
    control,
    name: 'equipos_recojo',
  });

  const tipoAtencion = watch('tipo_atencion');
  const mostrarRecojo = tipoAtencion === 'REEMPLAZO' || tipoAtencion === 'UPGRADE';

  const onSubmit = (data: GenerarActaFormData) => {
    console.log('📤 DATOS DEL FORMULARIO:', data); // ← AGREGAR ESTO
  console.log('📤 EQUIPOS ENTREGADOS:', data.equipos_entregados);
    mutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nueva Acta de Asignación</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="acta-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de atención */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Atención *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {TIPO_ATENCION_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 border border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      {...register('tipo_atencion')}
                      value={option.value}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.tipo_atencion && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo_atencion.message}</p>
              )}
            </div>

            {/* Información del usuario - 2 columnas */}
            <div className="grid grid-cols-2 gap-4">
              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <input
                  {...register('usuario')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre completo"
                />
                {errors.usuario && (
                  <p className="mt-1 text-sm text-red-600">{errors.usuario.message}</p>
                )}
              </div>

              {/* Ticket */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket *
                </label>
                <input
                  {...register('ticket')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="INC00000583060"
                />
                {errors.ticket && (
                  <p className="mt-1 text-sm text-red-600">{errors.ticket.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
                <select
                  {...register('area')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {AREAS_OPTIONS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                {errors.area && (
                  <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
                )}
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                <select
                  {...register('cargo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {CARGOS_OPTIONS.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
                {errors.cargo && (
                  <p className="mt-1 text-sm text-red-600">{errors.cargo.message}</p>
                )}
              </div>

              {/* Local */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local *</label>
                <Controller
                  name="local_id"
                  control={control}
                  render={({ field }) => (
                    <TiendaSelect value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.local_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.local_id.message}</p>
                )}
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio *
                </label>
                <input
                  {...register('fecha_inicio')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.fecha_inicio && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio.message}</p>
                )}
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin *
                </label>
                <input
                  {...register('fecha_fin')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.fecha_fin && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_fin.message}</p>
                )}
              </div>

              {/* Jefe Responsable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jefe/Responsable (Email) *
                </label>
                <input
                  {...register('jefe_responsable')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jefe@email.com"
                />
                {errors.jefe_responsable && (
                  <p className="mt-1 text-sm text-red-600">{errors.jefe_responsable.message}</p>
                )}
              </div>

              {/* Ing. de Soporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ing. de Soporte *
                </label>
                <select
                  {...register('ing_soporte')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {ING_SOPORTE_OPTIONS.map((ing) => (
                    <option key={ing} value={ing}>
                      {ing}
                    </option>
                  ))}
                </select>
                {errors.ing_soporte && (
                  <p className="mt-1 text-sm text-red-600">{errors.ing_soporte.message}</p>
                )}
              </div>
            </div>

            {/* Equipos Entregados */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Equipos Entregados</h3>
                <button
                  type="button"
                  onClick={() =>
                    appendEntregado({
                      categoria_id: 0,
                      subcategoria_id: 0,
                      marca_id: 0,
                      modelo_id: 0,
                      equipo: '',
                      marca: '',
                      modelo: '',
                      serie: '',
                      inventario: '',
                      hostname: '',
                      procesador: '',
                      disco: '',
                      ram: '',
                    })
                  }
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Agregar equipo
                </button>
              </div>

              <div className="space-y-4">
                {fieldsEntregados.map((field, index) => (
                  <EquipoEntregadoRow
                    key={field.id}
                    index={index}
                    control={control}
                    setValue={setValue}
                    errors={errors}
                    categorias={categorias || []}
                    onRemove={() => removeEntregado(index)}
                    canRemove={fieldsEntregados.length > 1}
                  />
                ))}
              </div>

              {/* Observaciones entregados */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  {...register('observaciones_entregados')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales sobre los equipos entregados..."
                />
              </div>
            </div>

            {/* Equipos Recojo (Condicional) */}
            {mostrarRecojo && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Equipos a Recoger</h3>
                  <button
                    type="button"
                    onClick={() =>
                      appendRecojo({
                        categoria_id: 0,
                        subcategoria_id: 0,
                        marca_id: 0,
                        modelo_id: 0,
                        equipo: '',
                        marca: '',
                        modelo: '',
                        serie: '',
                        inventario: '',
                        hostname: '',
                        procesador: '',
                        disco: '',
                        ram: '',
                        estado: 'OPERATIVO',
                      })
                    }
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar equipo
                  </button>
                </div>

                <div className="space-y-4">
                  {fieldsRecojo.map((field, index) => (
                    <EquipoRecojoRow
                      key={field.id}
                      index={index}
                      control={control}
                      setValue={setValue}
                      errors={errors}
                      categorias={categorias || []}
                      onRemove={() => removeRecojo(index)}
                      canRemove={true}
                    />
                  ))}
                </div>

                {/* Observaciones recojo */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    {...register('observaciones_recojo')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observaciones adicionales sobre los equipos a recoger..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="acta-form"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
};
// ============================================
// COMPONENTE AUXILIAR: EQUIPO ENTREGADO ROW
// ============================================

interface EquipoRowProps {
  index: number;
  control: any;
  setValue: UseFormSetValue<GenerarActaFormData>;
  errors: any;
  categorias: any[];
  onRemove: () => void;
  canRemove: boolean;
}

const EquipoEntregadoRow: React.FC<EquipoRowProps> = ({
  index,
  control,
  setValue,
  errors,
  categorias,
  onRemove,
  canRemove,
}) => {
  // Watch de los IDs para los combos escalonados
  const categoriaId = useWatch({
    control,
    name: `equipos_entregados.${index}.categoria_id`,
    defaultValue: 0,
  });

  const subcategoriaId = useWatch({
    control,
    name: `equipos_entregados.${index}.subcategoria_id`,
    defaultValue: 0,
  });

  const marcaId = useWatch({
    control,
    name: `equipos_entregados.${index}.marca_id`,
    defaultValue: 0,
  });


  // Queries para combos escalonados
  const { data: subcategorias } = useQuery({
    queryKey: ['subcategorias', 'categoria', categoriaId],
    queryFn: () => obtenerSubcategoriasPorCategoria(categoriaId),
    enabled: categoriaId > 0,
  });

  const { data: marcas } = useQuery({
    queryKey: ['marcas', 'subcategoria', subcategoriaId],
    queryFn: () => obtenerMarcasPorSubcategoria(subcategoriaId),
    enabled: subcategoriaId > 0,
  });

  const { data: modelos } = useQuery({
    queryKey: ['modelos', 'marca-subcategoria', marcaId, subcategoriaId],
    queryFn: () => obtenerModelosPorMarcaYSubcategoria(marcaId, subcategoriaId),
    enabled: marcaId > 0 && subcategoriaId > 0,
  });

  // Detectar si es laptop/desktop para mostrar campos técnicos
  const subcategoriaNombre = subcategorias?.find((s) => s.id === subcategoriaId)?.nombre || '';
  const esLaptopODesktop =
    subcategoriaNombre.toUpperCase().includes('LAPTOP') ||
    subcategoriaNombre.toUpperCase().includes('DESKTOP') ||
    subcategoriaNombre.toUpperCase().includes('NOTEBOOK') ||
    subcategoriaNombre.toUpperCase().includes('PC');

  // Handler para cambio de categoría
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoriaId = parseInt(e.target.value);

    setValue(`equipos_entregados.${index}.categoria_id`, newCategoriaId);
    setValue(`equipos_entregados.${index}.subcategoria_id`, 0);
    setValue(`equipos_entregados.${index}.marca_id`, 0);
    setValue(`equipos_entregados.${index}.modelo_id`, 0);
    setValue(`equipos_entregados.${index}.equipo`, '');
    setValue(`equipos_entregados.${index}.marca`, '');
    setValue(`equipos_entregados.${index}.modelo`, '');
  };

  // Handler para cambio de subcategoría
  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubcategoriaId = parseInt(e.target.value);
    const subcategoria = subcategorias?.find((s) => s.id === newSubcategoriaId);

    setValue(`equipos_entregados.${index}.subcategoria_id`, newSubcategoriaId);
    setValue(`equipos_entregados.${index}.equipo`, subcategoria?.nombre || '');
    setValue(`equipos_entregados.${index}.marca_id`, 0);
    setValue(`equipos_entregados.${index}.modelo_id`, 0);
    setValue(`equipos_entregados.${index}.marca`, '');
    setValue(`equipos_entregados.${index}.modelo`, '');
  };

  // Handler para cambio de marca
  const handleMarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMarcaId = parseInt(e.target.value);
    const marca = marcas?.find((m) => m.id === newMarcaId);

    setValue(`equipos_entregados.${index}.marca_id`, newMarcaId);
    setValue(`equipos_entregados.${index}.marca`, marca?.nombre || '');
    setValue(`equipos_entregados.${index}.modelo_id`, 0);
    setValue(`equipos_entregados.${index}.modelo`, '');
  };

  // Handler para cambio de modelo
  const handleModeloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModeloId = parseInt(e.target.value);
    const modelo = modelos?.find((m) => m.id === newModeloId);

    setValue(`equipos_entregados.${index}.modelo_id`, newModeloId);
    setValue(`equipos_entregados.${index}.modelo`, modelo?.nombre || '');

    // Auto-llenar especificaciones técnicas si existen
    if (modelo?.especificaciones_tecnicas) {
      const specs = modelo.especificaciones_tecnicas;
      if (specs.procesador) setValue(`equipos_entregados.${index}.procesador`, specs.procesador);
      if (specs.disco) setValue(`equipos_entregados.${index}.disco`, specs.disco);
      if (specs.ram) setValue(`equipos_entregados.${index}.ram`, specs.ram);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Equipo #{index + 1}</span>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Fila 1: Tipo de Equipo (Categoría) */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Equipo *
          </label>
          <Controller
            name={`equipos_entregados.${index}.categoria_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleCategoriaChange(e);
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_entregados?.[index]?.categoria_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_entregados[index].categoria_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Fila 2: Equipo (Subcategoría), Marca, Modelo */}
      <div className="grid grid-cols-3 gap-3">
        {/* Equipo (Subcategoría) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Equipo *</label>
          <Controller
            name={`equipos_entregados.${index}.subcategoria_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleSubcategoriaChange(e);
                }}
                disabled={!categoriaId}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {subcategorias?.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_entregados?.[index]?.subcategoria_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_entregados[index].subcategoria_id.message}
            </p>
          )}
        </div>

        {/* Marca */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Marca *</label>
          <Controller
            name={`equipos_entregados.${index}.marca_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleMarcaChange(e);
                }}
                disabled={!subcategoriaId}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {marcas?.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_entregados?.[index]?.marca_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_entregados[index].marca_id.message}
            </p>
          )}
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Modelo *</label>
          <Controller
            name={`equipos_entregados.${index}.modelo_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleModeloChange(e);
                }}
                disabled={!marcaId || !subcategoriaId}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {modelos?.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_entregados?.[index]?.modelo_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_entregados[index].modelo_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Fila 3: Serie e Inventario */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Serie *</label>
          <Controller
            name={`equipos_entregados.${index}.serie`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors?.equipos_entregados?.[index]?.serie && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_entregados[index].serie.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Inventario *</label>
          <Controller
            name={`equipos_entregados.${index}.inventario`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors?.equipos_entregados?.[index]?.inventario && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_entregados[index].inventario.message}
            </p>
          )}
        </div>
      </div>

      {/* Campos técnicos (solo para LAPTOP o DESKTOP) */}
      {esLaptopODesktop && (
        <div className="grid grid-cols-4 gap-3 bg-blue-50 p-3 rounded">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hostname</label>
            <Controller
              name={`equipos_entregados.${index}.hostname`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Procesador</label>
            <Controller
              name={`equipos_entregados.${index}.procesador`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Disco</label>
            <Controller
              name={`equipos_entregados.${index}.disco`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="256 GB SSD"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">RAM</label>
            <Controller
              name={`equipos_entregados.${index}.ram`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="8 GB"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
// ============================================
// COMPONENTE AUXILIAR: EQUIPO RECOJO ROW
// ============================================

interface EquipoRecojoRowProps {
  index: number;
  control: any;
  setValue: UseFormSetValue<GenerarActaFormData>;
  errors: any;
  categorias: any[];
  onRemove: () => void;
  canRemove: boolean;
}

const EquipoRecojoRow: React.FC<EquipoRecojoRowProps> = ({
  index,
  control,
  setValue,
  errors,
  categorias,
  onRemove,
  canRemove,
}) => {
  // Watch de los IDs para los combos escalonados
  const categoriaId = useWatch({
    control,
    name: `equipos_recojo.${index}.categoria_id`,
    defaultValue: 0,
  });

  const subcategoriaId = useWatch({
    control,
    name: `equipos_recojo.${index}.subcategoria_id`,
    defaultValue: 0,
  });

  const marcaId = useWatch({
    control,
    name: `equipos_recojo.${index}.marca_id`,
    defaultValue: 0,
  });

  // Queries para combos escalonados
  const { data: subcategorias } = useQuery({
    queryKey: ['subcategorias', 'categoria', categoriaId],
    queryFn: () => obtenerSubcategoriasPorCategoria(categoriaId),
    enabled: categoriaId > 0,
  });

  const { data: marcas } = useQuery({
    queryKey: ['marcas', 'subcategoria', subcategoriaId],
    queryFn: () => obtenerMarcasPorSubcategoria(subcategoriaId),
    enabled: subcategoriaId > 0,
  });

  const { data: modelos } = useQuery({
    queryKey: ['modelos', 'marca-subcategoria', marcaId, subcategoriaId],
    queryFn: () => obtenerModelosPorMarcaYSubcategoria(marcaId, subcategoriaId),
    enabled: marcaId > 0 && subcategoriaId > 0,
  });

  // Detectar si es laptop/desktop para mostrar campos técnicos
  const subcategoriaNombre = subcategorias?.find((s) => s.id === subcategoriaId)?.nombre || '';
  const esLaptopODesktop =
    subcategoriaNombre.toUpperCase().includes('LAPTOP') ||
    subcategoriaNombre.toUpperCase().includes('DESKTOP') ||
    subcategoriaNombre.toUpperCase().includes('NOTEBOOK') ||
    subcategoriaNombre.toUpperCase().includes('PC');

  // Handler para cambio de categoría
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoriaId = parseInt(e.target.value);

    setValue(`equipos_recojo.${index}.categoria_id`, newCategoriaId);
    setValue(`equipos_recojo.${index}.subcategoria_id`, 0);
    setValue(`equipos_recojo.${index}.marca_id`, 0);
    setValue(`equipos_recojo.${index}.modelo_id`, 0);
    setValue(`equipos_recojo.${index}.equipo`, '');
    setValue(`equipos_recojo.${index}.marca`, '');
    setValue(`equipos_recojo.${index}.modelo`, '');
  };

  // Handler para cambio de subcategoría
  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubcategoriaId = parseInt(e.target.value);
    const subcategoria = subcategorias?.find((s) => s.id === newSubcategoriaId);

    setValue(`equipos_recojo.${index}.subcategoria_id`, newSubcategoriaId);
    setValue(`equipos_recojo.${index}.equipo`, subcategoria?.nombre || '');
    setValue(`equipos_recojo.${index}.marca_id`, 0);
    setValue(`equipos_recojo.${index}.modelo_id`, 0);
    setValue(`equipos_recojo.${index}.marca`, '');
    setValue(`equipos_recojo.${index}.modelo`, '');
  };

  // Handler para cambio de marca
  const handleMarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMarcaId = parseInt(e.target.value);
    const marca = marcas?.find((m) => m.id === newMarcaId);

    setValue(`equipos_recojo.${index}.marca_id`, newMarcaId);
    setValue(`equipos_recojo.${index}.marca`, marca?.nombre || '');
    setValue(`equipos_recojo.${index}.modelo_id`, 0);
    setValue(`equipos_recojo.${index}.modelo`, '');
  };

  // Handler para cambio de modelo
  const handleModeloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModeloId = parseInt(e.target.value);
    const modelo = modelos?.find((m) => m.id === newModeloId);

    setValue(`equipos_recojo.${index}.modelo_id`, newModeloId);
    setValue(`equipos_recojo.${index}.modelo`, modelo?.nombre || '');

    // Auto-llenar especificaciones técnicas si existen
    if (modelo?.especificaciones_tecnicas) {
      const specs = modelo.especificaciones_tecnicas;
      if (specs.procesador) setValue(`equipos_recojo.${index}.procesador`, specs.procesador);
      if (specs.disco) setValue(`equipos_recojo.${index}.disco`, specs.disco);
      if (specs.ram) setValue(`equipos_recojo.${index}.ram`, specs.ram);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-orange-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Equipo a Recoger #{index + 1}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Fila 1: Tipo de Equipo (Categoría) */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Equipo *
          </label>
          <Controller
            name={`equipos_recojo.${index}.categoria_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleCategoriaChange(e);
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_recojo?.[index]?.categoria_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_recojo[index].categoria_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Fila 2: Equipo (Subcategoría), Marca, Modelo */}
      <div className="grid grid-cols-3 gap-3">
        {/* Equipo (Subcategoría) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Equipo *</label>
          <Controller
            name={`equipos_recojo.${index}.subcategoria_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleSubcategoriaChange(e);
                }}
                disabled={!categoriaId}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {subcategorias?.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_recojo?.[index]?.subcategoria_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_recojo[index].subcategoria_id.message}
            </p>
          )}
        </div>

        {/* Marca */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Marca *</label>
          <Controller
            name={`equipos_recojo.${index}.marca_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleMarcaChange(e);
                }}
                disabled={!subcategoriaId}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {marcas?.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_recojo?.[index]?.marca_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_recojo[index].marca_id.message}
            </p>
          )}
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Modelo *</label>
          <Controller
            name={`equipos_recojo.${index}.modelo_id`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleModeloChange(e);
                }}
                disabled={!marcaId || !subcategoriaId}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {modelos?.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.equipos_recojo?.[index]?.modelo_id && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_recojo[index].modelo_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Fila 3: Serie e Inventario */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Serie *</label>
          <Controller
            name={`equipos_recojo.${index}.serie`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors?.equipos_recojo?.[index]?.serie && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_recojo[index].serie.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Inventario *</label>
          <Controller
            name={`equipos_recojo.${index}.inventario`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors?.equipos_recojo?.[index]?.inventario && (
            <p className="text-xs text-red-600 mt-1">
              {errors.equipos_recojo[index].inventario.message}
            </p>
          )}
        </div>
      </div>

      {/* Campos técnicos (solo para LAPTOP o DESKTOP) y Estado */}
      <div
        className={`grid ${
          esLaptopODesktop ? 'grid-cols-5' : 'grid-cols-1'
        } gap-3 bg-orange-100 p-3 rounded`}
      >
        {esLaptopODesktop && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hostname</label>
              <Controller
                name={`equipos_recojo.${index}.hostname`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Procesador</label>
              <Controller
                name={`equipos_recojo.${index}.procesador`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Disco</label>
              <Controller
                name={`equipos_recojo.${index}.disco`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="256 GB SSD"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">RAM</label>
              <Controller
                name={`equipos_recojo.${index}.ram`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="8 GB"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
          </>
        )}

        {/* Estado (siempre visible para recojo) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado *</label>
          <Controller
            name={`equipos_recojo.${index}.estado`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                {ESTADO_EQUIPO_OPTIONS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ActaFormModal;