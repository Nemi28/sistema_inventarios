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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { tiendaSchema, TiendaFormData } from '@/lib/validations';
import { useCreateTienda } from '../hooks/useCreateTienda';
import { useUpdateTienda } from '../hooks/useUpdateTienda';
import { Tienda } from '../types';
import { listarSocios } from '@/features/socios/services/socios.service';

interface TiendaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tienda?: Tienda | null;
}

export const TiendaFormModal = ({
  open,
  onOpenChange,
  tienda,
}: TiendaFormModalProps) => {
  const isEditing = !!tienda;
  const createMutation = useCreateTienda();
  const updateMutation = useUpdateTienda();
  const [socios, setSocios] = useState<any[]>([]);
  const [loadingSocios, setLoadingSocios] = useState(false);

  const form = useForm<TiendaFormData>({
    resolver: zodResolver(tiendaSchema),
    defaultValues: {
      pdv: '',
      tipo_local: 'TIENDA' as const,
      perfil_local: 'TPF' as const,
      nombre_tienda: '',
      socio_id: 0,
      direccion: '',
      ubigeo: '',
      activo: true,
    },
    mode: 'onChange',
  });

  // Cargar lista de socios
  useEffect(() => {
    if (open) {
      setLoadingSocios(true);
      listarSocios({ activo: true, limit: 100 })
        .then((response) => {
          setSocios(response.data || []);
        })
        .catch((error) => {
          console.error('Error al cargar socios:', error);
        })
        .finally(() => {
          setLoadingSocios(false);
        });
    }
  }, [open]);

  // Resetear form cuando cambia la Tienda
  useEffect(() => {
    if (tienda) {
      form.reset({
        pdv: tienda.pdv,
        tipo_local: tienda.tipo_local as 'TIENDA',
        perfil_local: tienda.perfil_local as 'TPF' | 'TPF - TC',
        nombre_tienda: tienda.nombre_tienda,
        socio_id: tienda.socio_id,
        direccion: tienda.direccion,
        ubigeo: tienda.ubigeo,
        activo: Boolean(tienda.activo),
      });
    } else {
      form.reset({
        pdv: '',
        tipo_local: 'TIENDA' as const,
        perfil_local: 'TPF' as const,
        nombre_tienda: '',
        socio_id: 0,
        direccion: '',
        ubigeo: '',
        activo: true,
      });
    }
  }, [tienda, form]);

  const onSubmit = async (data: TiendaFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: tienda.id, ...data });
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Tienda' : 'Crear nueva Tienda'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos de la tienda existente' 
              : 'Completa el formulario para crear una nueva tienda'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* PDV */}
            <FormField
              control={form.control}
              name="pdv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDV *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234" 
                      className="font-mono"
                      maxLength={4}
                      disabled={isEditing}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    4 dígitos numéricos {isEditing && '(no se puede modificar)'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo Local */}
            <FormField
              control={form.control}
              name="tipo_local"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Local *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TIENDA">TIENDA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Perfil Local */}
            <FormField
              control={form.control}
              name="perfil_local"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Local *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TPF">TPF</SelectItem>
                      <SelectItem value="TPF - TC">TPF - TC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nombre Tienda */}
            <FormField
              control={form.control}
              name="nombre_tienda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Tienda *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="TPF Miraflores" 
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

            {/* Socio */}
            <FormField
              control={form.control}
              name="socio_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Socio *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={loadingSocios}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSocios ? "Cargando..." : "Seleccionar socio"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {socios.map((socio) => (
                        <SelectItem key={socio.id} value={socio.id.toString()}>
                          {socio.razon_social} - {socio.ruc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Socio de negocio asociado
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

            {/* UBIGEO */}
            <FormField
              control={form.control}
              name="ubigeo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UBIGEO *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="150101" 
                      className="font-mono"
                      maxLength={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    6 dígitos numéricos (código INEI)
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
                      La tienda estará {field.value ? 'activa' : 'inactiva'} en el sistema
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