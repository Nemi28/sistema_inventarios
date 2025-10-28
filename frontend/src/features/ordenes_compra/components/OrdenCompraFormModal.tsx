import { useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useCreateOrdenCompra } from '../hooks/useCreateOrdenCompra';
import { useUpdateOrdenCompra } from '../hooks/useUpdateOrdenCompra';
import { OrdenCompra } from '../types';
import {
  ordenCompraSchema,
  OrdenCompraFormValues,
} from '@/lib/ordenes-compra-validations';

interface OrdenCompraFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordenCompra?: OrdenCompra | null;
}

export const OrdenCompraFormModal = ({
  open,
  onOpenChange,
  ordenCompra,
}: OrdenCompraFormModalProps) => {
  const isEditing = !!ordenCompra;

  // Hooks
  const createMutation = useCreateOrdenCompra();
  const updateMutation = useUpdateOrdenCompra();

  // Form
  const form = useForm<OrdenCompraFormValues>({
    resolver: zodResolver(ordenCompraSchema),
    defaultValues: {
      numero_orden: '',
      detalle: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      activo: true,
    },
  });

  // Cargar datos al editar
  useEffect(() => {
  if (ordenCompra && open) {
    form.reset({
      numero_orden: ordenCompra.numero_orden,
      detalle: ordenCompra.detalle || '',
      fecha_ingreso: ordenCompra.fecha_ingreso.split('T')[0],
      activo: Boolean(ordenCompra.activo),  // ✅ Convertir a booleano
    });
  } else if (open && !ordenCompra) {
    form.reset({
      numero_orden: '',
      detalle: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      activo: true,
    });
  }
}, [ordenCompra, open, form]);

  useEffect(() => {
  const subscription = form.watch((value, { name, type }) => {
    console.log('👀 [FORM WATCH] Campo cambiado:', name, 'Valor:', value);
    console.log('👀 [FORM WATCH] Errores actuales:', form.formState.errors);
    console.log('👀 [FORM WATCH] Es válido:', form.formState.isValid);
  });
  return () => subscription.unsubscribe();
}, [form]);

 const onSubmit = async (data: OrdenCompraFormValues) => {
  console.log('🟢 [FRONTEND] Datos originales del formulario:', data);
  
  const formData = {
    ...data,
    detalle: data.detalle || null,
  };
  
  console.log('🟢 [FRONTEND] Datos preparados para enviar:', formData);
  console.log('🟢 [FRONTEND] ¿Es edición?:', isEditing);
  console.log('🟢 [FRONTEND] ID de orden:', ordenCompra?.id);

  try {
    if (isEditing && ordenCompra) {
      console.log('🟢 [FRONTEND] Llamando UPDATE con:', { id: ordenCompra.id, ...formData });
      const resultado = await updateMutation.mutateAsync({ id: ordenCompra.id, ...formData });
      console.log('🟢 [FRONTEND] Resultado UPDATE:', resultado);
    } else {
      console.log('🟢 [FRONTEND] Llamando CREATE con:', formData);
      const resultado = await createMutation.mutateAsync(formData);
      console.log('🟢 [FRONTEND] Resultado CREATE:', resultado);
    }
    console.log('✅ [FRONTEND] Operación exitosa, cerrando modal');
    onOpenChange(false);
    form.reset();
  } catch (error) {
    console.error('❌ [FRONTEND] Error en onSubmit:', error);
  }
};

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de Orden */}
              <FormField
                control={form.control}
                name="numero_orden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Orden *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: OC-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha de Ingreso */}
              <FormField
                control={form.control}
                name="fecha_ingreso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Ingreso *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Detalle */}
            <FormField
              control={form.control}
              name="detalle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalle</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción o notas adicionales..."
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

            {/* Activo */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado Activo</FormLabel>
                    <div className="text-sm text-gray-500">
                      Activar o desactivar esta orden en el sistema
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
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar' : 'Crear'} Orden
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};