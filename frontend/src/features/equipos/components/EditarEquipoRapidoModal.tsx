import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Loader2, Warehouse, Store, User } from 'lucide-react';
import { useUpdateEquipo } from '../hooks/useUpdateEquipo';
import { Equipo } from '../types';
import { toast } from 'sonner';

type VistaEquipo = 'ALMACEN' | 'TIENDA' | 'PERSONA';

interface EditarEquipoRapidoModalProps {
  open: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  vista: VistaEquipo;
}

// Schema base
const baseSchema = z.object({
  estado_actual: z.enum(['OPERATIVO', 'POR_VALIDAR', 'EN_GARANTIA', 'BAJA', 'INOPERATIVO']),
  observaciones: z.string().optional().or(z.literal('')),
});

// Schema para Almacén
const almacenSchema = baseSchema.extend({
  garantia: z.any().transform((val) => Boolean(val)),
  sistema_operativo: z.string().optional().or(z.literal('')),
});

// Schema para Tienda
const tiendaSchema = baseSchema.extend({
  hostname: z.string().optional().or(z.literal('')),
  posicion_tienda: z.string().optional().or(z.literal('')),
  area_tienda: z.string().optional().or(z.literal('')),
});

// Schema para Persona (solo base)
const personaSchema = baseSchema;

type AlmacenFormValues = z.infer<typeof almacenSchema>;
type TiendaFormValues = z.infer<typeof tiendaSchema>;
type PersonaFormValues = z.infer<typeof personaSchema>;
type FormValues = AlmacenFormValues | TiendaFormValues | PersonaFormValues;

const getSchema = (vista: VistaEquipo) => {
  switch (vista) {
    case 'ALMACEN':
      return almacenSchema;
    case 'TIENDA':
      return tiendaSchema;
    case 'PERSONA':
      return personaSchema;
    default:
      return baseSchema;
  }
};

const getVistaConfig = (vista: VistaEquipo) => {
  switch (vista) {
    case 'ALMACEN':
      return {
        title: 'Editar Equipo en Almacén',
        description: 'Modifica los datos del equipo almacenado',
        icon: Warehouse,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      };
    case 'TIENDA':
      return {
        title: 'Editar Equipo en Tienda',
        description: 'Modifica los datos del equipo en tienda',
        icon: Store,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    case 'PERSONA':
      return {
        title: 'Editar Equipo Asignado',
        description: 'Modifica los datos del equipo asignado a persona',
        icon: User,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
  }
};

export const EditarEquipoRapidoModal = ({
  open,
  onClose,
  equipo,
  vista,
}: EditarEquipoRapidoModalProps) => {
  const updateMutation = useUpdateEquipo();
  const config = getVistaConfig(vista);
  const Icon = config.icon;

  const form = useForm<FormValues>({
    resolver: zodResolver(getSchema(vista)),
    defaultValues: {
      estado_actual: 'OPERATIVO',
      observaciones: '',
      ...(vista === 'ALMACEN' && {
        garantia: false,
        sistema_operativo: '',
      }),
      ...(vista === 'TIENDA' && {
        hostname: '',
        posicion_tienda: '',
        area_tienda: '',
      }),
    },
    mode: 'onChange',
  });

  // Resetear form cuando cambia el equipo
  useEffect(() => {
    if (equipo && open) {
      const baseValues = {
        estado_actual: equipo.estado_actual || 'OPERATIVO',
        observaciones: equipo.observaciones || '',
      };

      if (vista === 'ALMACEN') {
        form.reset({
          ...baseValues,
          garantia: Boolean(equipo.garantia),
          sistema_operativo: equipo.sistema_operativo || '',
        });
      } else if (vista === 'TIENDA') {
        form.reset({
          ...baseValues,
          hostname: equipo.hostname || '',
          posicion_tienda: equipo.posicion_tienda || '',
          area_tienda: equipo.area_tienda || '',
        });
      } else {
        form.reset(baseValues);
      }
    }
  }, [equipo, open, vista, form]);

  const onSubmit = async (data: FormValues) => {
    if (!equipo) return;

    try {
      await updateMutation.mutateAsync({
        id: equipo.id,
        datos: data,
      });
      toast.success('Equipo actualizado correctamente');
      onClose();
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.error('Error al actualizar el equipo');
    }
  };

  const isLoading = updateMutation.isPending;

  if (!equipo) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Info del equipo */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Serie:</span>
            <span className="font-mono font-medium">{equipo.numero_serie || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Inv. Entel:</span>
            <span className="font-mono font-medium">{equipo.inv_entel || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Modelo:</span>
            <span className="font-medium">{equipo.modelo_nombre || 'N/A'}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Estado - Común a todas las vistas */}
            <FormField
              control={form.control}
              name="estado_actual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Campos específicos de ALMACÉN */}
            {vista === 'ALMACEN' && (
              <>
                <FormField
                  control={form.control}
                  name="garantia"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Garantía</FormLabel>
                        <FormDescription>¿El equipo tiene garantía vigente?</FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value as boolean}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-5 w-5"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sistema_operativo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sistema Operativo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Windows 10, Linux, etc." 
                          {...field} 
                          value={field.value as string || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Campos específicos de TIENDA */}
            {vista === 'TIENDA' && (
              <>
                <FormField
                  control={form.control}
                  name="hostname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hostname</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="PC-TIENDA-01" 
                          {...field} 
                          value={field.value as string || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="posicion_tienda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posición</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="1, 2, 3..." 
                            {...field} 
                            value={field.value as string || ''} 
                          />
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
                          <Input 
                            placeholder="CAJA, BACKOFFICE..." 
                            {...field} 
                            value={field.value as string || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Observaciones - Común a todas las vistas */}
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales..."
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};