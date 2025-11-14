import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCrearSubcategoria } from '@/features/subcategorias/hooks/useCrearSubcategoria';
import { useUpdateSubcategoria } from '@/features/subcategorias/hooks/useUpdateSubcategoria';
import { Subcategoria } from '@/features/subcategorias/types';

const subcategoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  activo: z.boolean(),
});

type SubcategoriaFormValues = z.infer<typeof subcategoriaSchema>;

interface SubcategoriaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategoria: Subcategoria | null;
  categoriaId: number;
}

export const SubcategoriaFormModal: React.FC<SubcategoriaFormModalProps> = ({
  open,
  onOpenChange,
  subcategoria,
  categoriaId,
}) => {
  const isEditing = !!subcategoria;
  const crearMutation = useCrearSubcategoria();
  const updateMutation = useUpdateSubcategoria();

  const form = useForm<SubcategoriaFormValues>({
    resolver: zodResolver(subcategoriaSchema),
    defaultValues: {
      nombre: '',
      activo: true,
    },
  });

  useEffect(() => {
    if (subcategoria) {
      form.reset({
        nombre: subcategoria.nombre,
        activo: subcategoria.activo,
      });
    } else {
      form.reset({
        nombre: '',
        activo: true,
      });
    }
  }, [subcategoria, form]);

  const onSubmit = (data: SubcategoriaFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: subcategoria.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      crearMutation.mutate(
        { ...data, categoria_id: categoriaId },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Corporativa, Gaming, Láser..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Subcategoría {field.value ? 'activa' : 'inactiva'}
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={crearMutation.isPending || updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={crearMutation.isPending || updateMutation.isPending}
              >
                {crearMutation.isPending || updateMutation.isPending
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};