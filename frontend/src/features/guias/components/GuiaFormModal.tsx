import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { guiaSchema, GuiaFormData } from '@/lib/validations';
import { useGenerarGuia } from '../hooks/useGenerarGuia';
import { TipoGuiaSelector } from './TipoGuiaSelector';
import { DetalleSkuRow } from './DetalleSkuRow';
import { TiendaCombobox} from './TiendaCombobox';

interface GuiaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GuiaFormModal = ({ open, onOpenChange }: GuiaFormModalProps) => {
  const generarMutation = useGenerarGuia();

  const form = useForm<GuiaFormData>({
    resolver: zodResolver(guiaSchema),
    defaultValues: {
      tipo: 'envio',
      fecha_inicio_traslado: new Date().toISOString().split('T')[0], // Fecha actual
      tienda_id: 0,
      nro_orden: '',
      observacion: '',
      detalle: [{ cantidad: 1, sku_id: 0, serie: '' }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'detalle',
  });

  const tipo = form.watch('tipo');

  const onSubmit = async (data: GuiaFormData) => {
    try {
      await generarMutation.mutateAsync(data);
      // NO cerrar automáticamente - dejar que el usuario cierre manualmente
      // El formulario se limpia para permitir generar otra guía
      form.reset({
        tipo: 'envio',
        fecha_inicio_traslado: new Date().toISOString().split('T')[0],
        tienda_id: 0,
        nro_orden: '',
        observacion: '',
        detalle: [{ cantidad: 1, sku_id: 0, serie: '' }],
      });
    } catch (error) {
      // Error manejado en el hook
    }
  };

  const handleClose = () => {
    if (!generarMutation.isPending) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl sm:text-2xl">
            Generar Guía de Remisión
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Complete el formulario para generar y descargar la guía en formato Excel
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Selector de tipo */}
            <TipoGuiaSelector control={form.control} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Fecha de inicio */}
              <FormField
                control={form.control}
                name="fecha_inicio_traslado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-semibold">
                      Fecha de Inicio de Traslado *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                {/* Tienda (origen o destino según tipo) - Con buscador */}
                <TiendaCombobox control={form.control} tipo={tipo} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Número de orden */}
              <FormField
                control={form.control}
                name="nro_orden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-semibold">
                      Número de Orden *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 0001"
                        {...field}
                        maxLength={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observación */}
              <FormField
                control={form.control}
                name="observacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-semibold">
                      Observación (opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Comentarios adicionales..."
                        {...field}
                        rows={3}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Detalle de SKUs */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Detalle de SKUs</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Agregue los equipos a incluir en la guía
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ cantidad: 1, sku_id: 0, serie: '' })}
                  disabled={generarMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar SKU
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <DetalleSkuRow
                    key={field.id}
                    index={index}
                    control={form.control}
                    onRemove={() => remove(index)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <p className="text-sm text-muted-foreground">
                    No hay SKUs agregados. Haga clic en "Agregar SKU" para empezar.
                  </p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={generarMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={generarMutation.isPending}
                className="w-full sm:w-auto"
              >
                {generarMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generar Excel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};