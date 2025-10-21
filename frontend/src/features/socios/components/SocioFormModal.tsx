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
import { socioSchema, SocioFormData } from '@/lib/validations';
import { useCreateSocio } from '../hooks/useCreateSocio';
import { useUpdateSocio } from '../hooks/useUpdateSocio';
import { Socio } from '../types';

interface SocioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socio?: Socio | null;
}

export const SocioFormModal = ({
  open,
  onOpenChange,
  socio,
}: SocioFormModalProps) => {
  const isEditing = !!socio;
  const createMutation = useCreateSocio();
  const updateMutation = useUpdateSocio();

  const form = useForm({
    resolver: zodResolver(socioSchema),
    defaultValues: {
      razon_social: '',
      ruc: '',
      direccion: '',
      activo: true,
    },
  });

  // Resetear form cuando cambia el Socio
  useEffect(() => {
    if (socio) {
      form.reset({
        razon_social: socio.razon_social,
        ruc: socio.ruc,
        direccion: socio.direccion,
        activo: socio.activo,
      });
    } else {
      form.reset({
        razon_social: '',
        ruc: '',
        direccion: '',
        activo: true,
      });
    }
  }, [socio, form]);

  const onSubmit = async (data: SocioFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: socio.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Socio' : 'Crear nuevo Socio'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del socio existente' 
              : 'Completa el formulario para crear un nuevo socio de negocio'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Razón Social */}
            <FormField
              control={form.control}
              name="razon_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón Social *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Empresa SAC" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 3 caracteres, máximo 50
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RUC */}
            <FormField
              control={form.control}
              name="ruc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUC *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="20123456789" 
                      className="font-mono"
                      maxLength={11}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    11 dígitos (validación con dígito verificador SUNAT)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Av. Principal 123, Lima" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 5 caracteres, máximo 100
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
                      El socio estará {field.value ? 'activo' : 'inactivo'} en el sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
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