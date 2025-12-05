import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Cpu, Unlink, AlertTriangle } from 'lucide-react';
import { equipoSchema, EquipoFormValues } from '../../../lib/equipos-validations';
import { useCreateEquipo } from '../hooks/useCreateEquipo';
import { useUpdateEquipo } from '../hooks/useUpdateEquipo';
import { Equipo } from '../types';
import { obtenerTiendas } from '@/features/tiendas/services/tiendas.service';
import { obtenerOrdenesCompra } from '@/features/ordenes_compra/services/ordenes_compra.service';
import { obtenerModeloPorId } from '@/features/modelos/services/modelos.service';
import { ModeloSelector } from '@/components/common/ModeloSelector';
import { TiendaCombobox } from '@/components/common/TiendaCombobox';
import { useDesinstalarAccesorio } from '@/features/movimientos/hooks/useDesinstalarAccesorio';

interface EquipoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipo?: Equipo | null;
}

export const EquipoFormModal = ({
  open,
  onOpenChange,
  equipo,
}: EquipoFormModalProps) => {
  
  const isEditing = !!equipo;
  const createMutation = useCreateEquipo();
  const updateMutation = useUpdateEquipo();
  const desinstalarMutation = useDesinstalarAccesorio();

  const [tiendas, setTiendas] = useState<any[]>([]);
  const [ordenesCompra, setOrdenesCompra] = useState<any[]>([]);
  const [loadingTiendas, setLoadingTiendas] = useState(false);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [showDesinstalarConfirm, setShowDesinstalarConfirm] = useState(false);

  // Estado para el selector de modelo
  const [modeloSelectorValue, setModeloSelectorValue] = useState({
    categoria_id: 0,
    subcategoria_id: 0,
    marca_id: 0,
    modelo_id: 0,
  });

  const form = useForm<EquipoFormValues>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      numero_serie: '',
      inv_entel: '',
      modelo_id: 0,
      orden_compra_id: undefined,
      tipo_propiedad: 'PROPIO',
      fecha_compra: '',
      garantia: false,
      sistema_operativo: '',
      estado_actual: 'POR_VALIDAR',
      ubicacion_actual: 'ALMACEN',
      tienda_id: undefined,
      hostname: '',
      posicion_tienda: '',
      area_tienda: '',
      es_accesorio: false,
      equipo_principal_id: undefined,
      observaciones: '',
      activo: true,
    },
    mode: 'onChange',
  });

  // Cargar datos necesarios
  useEffect(() => {
    if (open) {
      // Cargar tiendas
      setLoadingTiendas(true);
      obtenerTiendas()
        .then((data) => setTiendas(data || []))
        .catch((error) => console.error('Error al cargar tiendas:', error))
        .finally(() => setLoadingTiendas(false));

      // Cargar órdenes de compra
      setLoadingOrdenes(true);
      obtenerOrdenesCompra()
        .then((data) => setOrdenesCompra(data || []))
        .catch((error) => console.error('Error al cargar órdenes:', error))
        .finally(() => setLoadingOrdenes(false));
    }
  }, [open]);

  // Resetear form cuando cambia el equipo
  useEffect(() => {
    if (equipo && open) {
      form.reset({
        numero_serie: equipo.numero_serie || '',
        inv_entel: equipo.inv_entel || '',
        modelo_id: equipo.modelo_id || 0,
        orden_compra_id: equipo.orden_compra_id || undefined,
        tipo_propiedad: equipo.tipo_propiedad || 'PROPIO',
        fecha_compra: equipo.fecha_compra ? equipo.fecha_compra.split('T')[0] : '',
        garantia: equipo.garantia ?? false,
        sistema_operativo: equipo.sistema_operativo || '',
        estado_actual: equipo.estado_actual || 'POR_VALIDAR',
        ubicacion_actual: equipo.ubicacion_actual || 'ALMACEN',
        tienda_id: equipo.tienda_id || undefined,
        hostname: equipo.hostname || '',
        posicion_tienda: equipo.posicion_tienda || '',
        area_tienda: equipo.area_tienda || '',
        es_accesorio: equipo.es_accesorio ?? false,
        equipo_principal_id: equipo.equipo_principal_id || undefined,
        observaciones: equipo.observaciones || '',
        activo: equipo.activo ?? true,
      });

      // Cargar información completa del modelo para obtener categoria_id, subcategoria_id, marca_id
      if (equipo.modelo_id) {
        obtenerModeloPorId(equipo.modelo_id)
          .then((modeloData) => {
            if (modeloData) {
              setModeloSelectorValue({
                categoria_id: modeloData.categoria_id || 0,
                subcategoria_id: modeloData.subcategoria_id || 0,
                marca_id: modeloData.marca_id || 0,
                modelo_id: equipo.modelo_id || 0,
              });
            }
          })
          .catch((error) => console.error('Error al cargar modelo:', error));
      }
    } else if (!equipo && open) {
      form.reset({
        numero_serie: '',
        inv_entel: '',
        modelo_id: 0,
        orden_compra_id: undefined,
        tipo_propiedad: 'PROPIO',
        fecha_compra: '',
        garantia: false,
        sistema_operativo: '',
        estado_actual: 'POR_VALIDAR',
        ubicacion_actual: 'ALMACEN',
        tienda_id: undefined,
        hostname: '',
        posicion_tienda: '',
        area_tienda: '',
        es_accesorio: false,
        equipo_principal_id: undefined,
        observaciones: '',
        activo: true,
      });

      // Resetear selector de modelo
      setModeloSelectorValue({
        categoria_id: 0,
        subcategoria_id: 0,
        marca_id: 0,
        modelo_id: 0,
      });
    }
  }, [equipo, open, form]);

  const onSubmit = async (data: EquipoFormValues) => {
    try {
      const cleanData = {
        numero_serie: data.numero_serie?.trim() || undefined,
        inv_entel: data.inv_entel?.trim() || undefined,
        modelo_id: data.modelo_id,
        orden_compra_id: data.orden_compra_id || undefined,
        tipo_propiedad: data.tipo_propiedad,
        fecha_compra: data.fecha_compra?.trim() || undefined,
        garantia: !!data.garantia,
        sistema_operativo: data.sistema_operativo?.trim() || undefined,
        estado_actual: data.estado_actual,
        ubicacion_actual: data.ubicacion_actual,
        tienda_id: data.tienda_id || undefined,
        hostname: data.hostname?.trim() || undefined,
        posicion_tienda: data.posicion_tienda?.trim() || undefined,
        area_tienda: data.area_tienda?.trim() || undefined,
        es_accesorio: !!data.es_accesorio,
        equipo_principal_id: data.equipo_principal_id || undefined,
        observaciones: data.observaciones?.trim() || undefined,
        activo: !!data.activo,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: equipo.id, datos: cleanData });
      } else {
        await createMutation.mutateAsync(cleanData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const ubicacionActual = form.watch('ubicacion_actual');
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Handler para el selector de modelo
  const handleModeloSelectorChange = (value: any) => {
    setModeloSelectorValue(value);
    form.setValue('modelo_id', value.modelo_id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Equipo' : 'Crear nuevo Equipo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del equipo existente' 
              : 'Completa el formulario para crear un nuevo equipo'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de Serie */}
              <FormField
                control={form.control}
                name="numero_serie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Serie</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="SN123456789" 
                        className="font-mono"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Inventario Entel */}
              <FormField
                control={form.control}
                name="inv_entel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventario Entel</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="INV-2024-001" 
                        className="font-mono"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Código único</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ✅ COMPONENTE REUTILIZABLE DE MODELO */}
            <div>
              <ModeloSelector
                value={modeloSelectorValue}
                onChange={handleModeloSelectorChange}
                errors={{
                  categoria_id: form.formState.errors.modelo_id?.message,
                }}
                labels={{
                  categoria: 'Categoría',
                  subcategoria: 'Equipo',
                  marca: 'Marca',
                  modelo: 'Modelo',
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Propiedad */}
              <FormField
                control={form.control}
                name="tipo_propiedad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Propiedad *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROPIO">Propio</SelectItem>
                        <SelectItem value="ALQUILADO">Alquilado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Orden de Compra */}
              <FormField
                control={form.control}
                name="orden_compra_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden de Compra</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const numValue = parseInt(value);
                        field.onChange(numValue === 0 ? undefined : numValue);
                      }}
                      value={field.value?.toString() || '0'}
                      disabled={loadingOrdenes}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin OC" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sin orden de compra</SelectItem>
                        {ordenesCompra.map((orden) => (
                          <SelectItem key={orden.id} value={orden.id.toString()}>
                            {orden.numero_orden}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha de Compra */}
              <FormField
                control={form.control}
                name="fecha_compra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Compra</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Garantía */}
              <FormField
                control={form.control}
                name="garantia"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-2">
                    <div className="space-y-0.5">
                      <FormLabel>Garantía</FormLabel>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-5 w-5"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Sistema Operativo */}
              <FormField
                control={form.control}
                name="sistema_operativo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema Operativo</FormLabel>
                    <FormControl>
                      <Input placeholder="Windows 10" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado Actual */}
              <FormField
                control={form.control}
                name="estado_actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Actual *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPERATIVO">Operativo</SelectItem>
                        <SelectItem value="POR_VALIDAR">Por Validar</SelectItem>
                        <SelectItem value="EN_GARANTIA">En Garantía</SelectItem>
                        <SelectItem value="INOPERATIVO">Inoperativo</SelectItem>
                        <SelectItem value="BAJA">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ubicación Actual */}
              <FormField
                control={form.control}
                name="ubicacion_actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Actual *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALMACEN">Almacén</SelectItem>
                        <SelectItem value="TIENDA">Tienda</SelectItem>
                        <SelectItem value="PERSONA">Persona</SelectItem>
                        <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campos de Tienda - Solo si ubicación es TIENDA */}
            {ubicacionActual === 'TIENDA' && (
              <>
                {/* ✅ USAR EL COMPONENTE REUTILIZABLE */}
                <TiendaCombobox
                  control={form.control}
                  name="tienda_id"
                  label="Tienda"
                  placeholder="Buscar tienda por nombre o PDV..."
                  tiendas={tiendas}
                  isLoading={loadingTiendas}
                  required={false}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="hostname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hostname</FormLabel>
                        <FormControl>
                          <Input placeholder="PC-TIENDA-01" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="posicion_tienda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posición</FormLabel>
                        <FormControl>
                          <Input placeholder="5" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area_tienda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área</FormLabel>
                        <FormControl>
                          <Input placeholder="CAJA" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Es Accesorio */}
            <FormField
              control={form.control}
              name="es_accesorio"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">¿Es accesorio?</FormLabel>
                    <FormDescription>
                      Marcar si este equipo es un accesorio de otro equipo principal
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Instalado en - Solo si es accesorio y tiene equipo principal */}
{isEditing && Boolean(equipo?.es_accesorio) && equipo?.equipo_principal_id && (
  <>
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Instalado en:</p>
            <p className="text-sm text-amber-700">
              {equipo.equipo_principal_modelo} - {equipo.equipo_principal_serie || equipo.equipo_principal_inv_entel || 'S/N'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
          onClick={() => setShowDesinstalarConfirm(true)}
          disabled={desinstalarMutation.isPending}
        >
          {desinstalarMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Unlink className="h-4 w-4 mr-1" />
              Desinstalar
            </>
          )}
        </Button>
      </div>
    </div>

    {/* Modal de confirmación para desinstalar */}
    <Dialog open={showDesinstalarConfirm} onOpenChange={setShowDesinstalarConfirm}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Desinstalar Accesorio?
          </DialogTitle>
          <DialogDescription>
            Estás a punto de desinstalar este accesorio del equipo principal.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Accesorio:</span>
            <span className="font-medium">{equipo.subcategoria_nombre} - {equipo.modelo_nombre}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Serie:</span>
            <span className="font-mono">{equipo.numero_serie || 'S/N'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Equipo principal:</span>
            <span className="font-medium">{equipo.equipo_principal_modelo} - {equipo.equipo_principal_serie}</span>
          </div>
        </div>

        <p className="text-sm text-amber-600">
          El accesorio quedará disponible para ser instalado en otro equipo.
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDesinstalarConfirm(false)}
            disabled={desinstalarMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              desinstalarMutation.mutate(
                { accesorioId: equipo.id },
                {
                  onSuccess: () => {
                    setShowDesinstalarConfirm(false);
                    onOpenChange(false);
                  },
                }
              );
            }}
            disabled={desinstalarMutation.isPending}
          >
            {desinstalarMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Unlink className="h-4 w-4 mr-2" />
            )}
            Desinstalar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
)}

            {/* Observaciones */}
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional del equipo..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado Activo */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado</FormLabel>
                    <FormDescription>
                      El equipo estará {field.value ? 'activo' : 'inactivo'} en el sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};