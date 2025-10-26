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
import { categoriaSchema, CategoriaFormData } from '@/lib/validations';
import { useCreateCategoria } from '../hooks/useCreateCategoria';
import { useUpdateCategoria } from '../hooks/useUpdateCategoria';
import { Categoria } from '../types';

interface CategoriaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria?: Categoria | null;
}

export const CategoriaFormModal = ({
  open,
  onOpenChange,
  categoria,
}: CategoriaFormModalProps) => {
  const isEditing = !!categoria;
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();

  const form = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema) as any,
    defaultValues: {
      nombre: '',
      activo: true,
    },
    mode: 'onChange',
  });

  // Resetear form cuando cambia la categoría
  useEffect(() => {
    if (categoria) {
      form.reset({
        nombre: categoria.nombre,
        activo: Boolean(categoria.activo),
      });
    } else {
      form.reset({
        nombre: '',
        activo: true,
      });
    }
  }, [categoria, form]);

  const onSubmit = async (data: CategoriaFormData) => {
    console.log('📝 Datos del formulario:', data);
    console.log('✏️ ¿Es edición?', isEditing);
    console.log('🆔 ID de la categoría:', categoria?.id);
    
    try {
      if (isEditing && categoria) {
        console.log('🔄 Llamando updateMutation...');
        await updateMutation.mutateAsync({ id: categoria.id, ...data });
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
            {isEditing ? 'Editar Categoría' : 'Crear nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos de la categoría existente' 
              : 'Completa el formulario para crear una nueva categoría'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Electrónica, Ropa, Alimentos..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 2 caracteres, máximo 50
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
                      La categoría estará {field.value ? 'activa' : 'inactiva'} en el sistema
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