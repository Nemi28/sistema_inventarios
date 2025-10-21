import { useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { skuSchema, SKUFormData } from '@/lib/validations';
import { useCreateSKU } from '../hooks/useCreateSKU';
import { useUpdateSKU } from '../hooks/useUpdateSKU';
import { SKU } from '../types';

interface SKUFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sku?: SKU | null;
}

export const SKUFormModal = ({
  open,
  onOpenChange,
  sku,
}: SKUFormModalProps) => {
  const isEditing = !!sku;
  const createMutation = useCreateSKU();
  const updateMutation = useUpdateSKU();

  const form = useForm<SKUFormData>({
    resolver: zodResolver(skuSchema) as any,
    defaultValues: {
      codigo_sku: '',
      descripcion_sku: '',
      activo: true,
    },
    mode: 'onChange',
  });

  // Resetear form cuando cambia el SKU
  useEffect(() => {
    if (sku) {
      form.reset({
        codigo_sku: sku.codigo_sku,
        descripcion_sku: sku.descripcion_sku,
        activo: Boolean(sku.activo),
      });
    } else {
      form.reset({
        codigo_sku: '',
        descripcion_sku: '',
        activo: true,
      });
    }
  }, [sku, form]);

  const onSubmit = async (data: SKUFormData) => {
    console.log('📝 Datos del formulario:', data);
    console.log('✏️ ¿Es edición?', isEditing);
    console.log('🆔 ID del SKU:', sku?.id);
    
    try {
      if (isEditing && sku) {
        console.log('🔄 Llamando updateMutation...');
        await updateMutation.mutateAsync({ id: sku.id, ...data });
      } else {
        console.log('➕ Llamando createMutation...');
        await createMutation.mutateAsync(data);
      }
      console.log('✅ Operación exitosa');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('❌ Error en onSubmit:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar SKU' : 'Crear nuevo SKU'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del SKU existente' 
              : 'Completa el formulario para crear un nuevo SKU'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Código SKU */}
            <FormField
              control={form.control}
              name="codigo_sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código SKU *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SKU-001" 
                      className="font-mono"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Alfanumérico, 3-20 caracteres, se permiten guiones
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion_sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Descripción del producto" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 3 caracteres, máximo 100
                  </FormDescription>
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
                      El SKU estará {field.value ? 'activo' : 'inactivo'} en el sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="h-5 w-5 cursor-pointer"
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