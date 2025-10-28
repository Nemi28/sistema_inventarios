import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCreateEquipo } from '../hooks/useCreateEquipo';
import { useUpdateEquipo } from '../hooks/useUpdateEquipo';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { useOrdenesCompraActivas } from '@/features/ordenes_compra/hooks/useOrdenesCompraActivas';
import { Equipo, ESTADOS_EQUIPO } from '../types';
import { equipoSchema, EquipoFormValues } from '@/lib/equipos-validations';

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
  const [showDetalles, setShowDetalles] = useState(false);
  const [detalleText, setDetalleText] = useState('');
  const [jsonError, setJsonError] = useState('');

  const isEditing = !!equipo;

  // Hooks
  const createMutation = useCreateEquipo();
  const updateMutation = useUpdateEquipo();
  const { data: categoriasData } = useCategorias({ activo: true });

  const categorias = categoriasData?.data || [];

  const { data: ordenesData } = useOrdenesCompraActivas();
  const ordenesCompra = ordenesData?.data || [];

  // Form
  const form = useForm<EquipoFormValues>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      categoria_id: 0,
      nombre: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      inv_entel: '',
      estado: 'nuevo',
      observacion: '',
      activo: true,
      orden_compra_id: null,
    },
  });

  // Cargar datos del equipo al editar
  useEffect(() => {
    if (equipo && open) {
      form.reset({
        orden_compra_id: equipo.orden_compra_id,
        categoria_id: equipo.categoria_id,
        nombre: equipo.nombre,
        marca: equipo.marca,
        modelo: equipo.modelo,
        numero_serie: equipo.numero_serie || '',
        inv_entel: equipo.inv_entel || '',
        estado: equipo.estado,
        observacion: equipo.observacion || '',
        activo: Boolean(equipo.activo),
      });

      if (equipo.detalle) {
        setDetalleText(JSON.stringify(equipo.detalle, null, 2));
        setShowDetalles(true);
      }
    } else if (open && !equipo) {
      form.reset({
        categoria_id: 0,
        nombre: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        inv_entel: '',
        estado: 'nuevo',
        observacion: '',
        activo: true,
        orden_compra_id: null,
      });
      setDetalleText('');
      setShowDetalles(false);
      setJsonError('');
    }
  }, [equipo, open, form]);

  // Validar JSON en tiempo real
  useEffect(() => {
    if (detalleText.trim() === '') {
      setJsonError('');
      return;
    }

    try {
      JSON.parse(detalleText);
      setJsonError('');
    } catch {
      setJsonError('JSON inválido');
    }
  }, [detalleText]);

  const onSubmit = async (data: EquipoFormValues) => {
    // Parsear detalle JSON si existe
    let detalleParsed = null;
    if (detalleText.trim()) {
      try {
        detalleParsed = JSON.parse(detalleText);
      } catch {
        setJsonError('El JSON no es válido');
        return;
      }
    }

    const formData = {
      ...data,
      numero_serie: data.numero_serie || null,
      inv_entel: data.inv_entel || null,
      observacion: data.observacion || null,
      detalle: detalleParsed,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: equipo.id, data: formData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
            setDetalleText('');
            setShowDetalles(false);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setDetalleText('');
          setShowDetalles(false);
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categoría */}
              <FormField
                control={form.control}
                name="categoria_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
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
        onValueChange={(value) => 
          field.onChange(value === 'null' ? null : Number(value))
        }
        value={field.value?.toString() || 'null'}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una orden (opcional)" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="null">Sin orden de compra</SelectItem>
          {ordenesCompra.map((orden) => (
            <SelectItem key={orden.id} value={orden.id.toString()}>
              {orden.numero_orden} - {new Date(orden.fecha_ingreso).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

              {/* Estado */}
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESTADOS_EQUIPO.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Equipo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Laptop HP EliteBook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Marca */}
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: HP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Modelo */}
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: EliteBook 840 G8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número de Serie */}
              <FormField
                control={form.control}
                name="numero_serie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Serie</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 5CD1234ABC"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Inventario ENTEL */}
              <FormField
                control={form.control}
                name="inv_entel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventario ENTEL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Código interno"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observaciones */}
            <FormField
              control={form.control}
              name="observacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el equipo..."
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

            {/* Detalles Técnicos (Colapsable) */}
            <div className="border rounded-lg p-4">
              <button
                type="button"
                onClick={() => setShowDetalles(!showDetalles)}
                className="flex items-center justify-between w-full text-left font-medium"
              >
                <span>Detalles Técnicos (Opcional)</span>
                {showDetalles ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showDetalles && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Ingresa especificaciones técnicas en formato JSON
                  </p>
                  <Textarea
                    placeholder='{"procesador": "Intel i7", "ram": "16GB", "disco": "512GB SSD"}'
                    className="font-mono text-sm"
                    rows={6}
                    value={detalleText}
                    onChange={(e) => setDetalleText(e.target.value)}
                  />
                  {jsonError && (
                    <p className="text-sm text-red-600">{jsonError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Activo */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado Activo</FormLabel>
                    <div className="text-sm text-gray-500">
                      Activar o desactivar este equipo en el sistema
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !!jsonError}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar' : 'Crear'} Equipo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};