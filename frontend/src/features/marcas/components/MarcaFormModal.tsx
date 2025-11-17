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
import { useCrearMarca } from '../hooks/useCrearMarca';
import { useUpdateMarca } from '../hooks/useUpdateMarca';
import { Marca } from '../types';

const marcaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  activo: z.boolean(),
});

type MarcaFormValues = z.infer<typeof marcaSchema>;

interface MarcaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marca: Marca | null;
}

export const MarcaFormModal: React.FC<MarcaFormModalProps> = ({
  open,
  onOpenChange,
  marca,
}) => {
  const isEditing = !!marca;
  const crearMutation = useCrearMarca();
  const updateMutation = useUpdateMarca();

  const form = useForm<MarcaFormValues>({
    resolver: zodResolver(marcaSchema),
    defaultValues: {
      nombre: '',
      activo: true,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (marca) {
      form.reset(
        {
          nombre: marca.nombre,
          activo: Boolean(marca.activo),
        },
        {
          keepDefaultValues: false,
        }
      );
    } else {
      form.reset({
        nombre: '',
        activo: true,
      });
    }
  }, [marca, form]);

  const onSubmit = (data: MarcaFormValues) => {
    if (isEditing && marca) {
      updateMutation.mutate(
        { id: marca.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      crearMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  const isLoading = crearMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Marca' : 'Nueva Marca'}</DialogTitle>
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
                    <Input placeholder="Ej: HP, Lenovo, Dell..." {...field} />
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
                      Marca {field.value ? 'activa' : 'inactiva'}
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};