import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useCrearModelo } from '../hooks/useCrearModelo';
import { useUpdateModelo } from '../hooks/useUpdateModelo';
import { useSubcategoriasPorCategoria } from '@/features/subcategorias/hooks/useSubcategoriasPorCategoria';
import { useMarcasActivas } from '@/features/marcas/hooks/useMarcasActivas';
import { useSkusActivos } from '@/features/skus/hooks/useSkusActivos';
import { Modelo } from '../types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Check, X } from 'lucide-react';

const modeloSchema = z.object({
  subcategoria_id: z.number().min(1, 'La subcategoría es requerida'),
  marca_id: z.number().min(1, 'La marca es requerida'),
  sku_id: z.number().nullable().optional(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  especificaciones_tecnicas: z.string().optional(),
  activo: z.boolean(),
});

type ModeloFormValues = z.infer<typeof modeloSchema>;

interface ModeloFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelo: Modelo | null;
  categoriaId: number;
}

export const ModeloFormModal: React.FC<ModeloFormModalProps> = ({
  open,
  onOpenChange,
  modelo,
  categoriaId,
}) => {
  const isEditing = !!modelo;
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [skuPopoverOpen, setSkuPopoverOpen] = useState(false);
  
  const crearMutation = useCrearModelo();
  const updateMutation = useUpdateModelo();

  const { data: subcategorias } = useSubcategoriasPorCategoria(categoriaId);
  const { data: marcas } = useMarcasActivas();
  const { data: skus = [], isLoading: skusLoading } = useSkusActivos();

  const form = useForm<ModeloFormValues>({
    resolver: zodResolver(modeloSchema),
    defaultValues: {
      subcategoria_id: 0,
      marca_id: 0,
      sku_id: null,
      nombre: '',
      especificaciones_tecnicas: '',
      activo: true,
    },
  });

  const skuIdSeleccionado = form.watch('sku_id');
  const skuSeleccionado = skus.find((s) => s.id === skuIdSeleccionado);

  useEffect(() => {
    if (modelo) {
      form.reset({
        subcategoria_id: modelo.subcategoria_id,
        marca_id: modelo.marca_id,
        sku_id: modelo.sku_id || null,
        nombre: modelo.nombre,
        especificaciones_tecnicas: modelo.especificaciones_tecnicas
          ? JSON.stringify(modelo.especificaciones_tecnicas, null, 2)
          : '',
        activo: Boolean(modelo.activo),
      },
      {
        keepDefaultValues: false,  
      }
    );
    } else {
      form.reset({
        subcategoria_id: 0,
        marca_id: 0,
        sku_id: null,
        nombre: '',
        especificaciones_tecnicas: '',
        activo: true,
      });
    }
    setJsonError(null);
  }, [modelo, form]);

  const validateJSON = (jsonString: string): boolean => {
    if (!jsonString || jsonString.trim() === '') {
      setJsonError(null);
      return true;
    }

    try {
      JSON.parse(jsonString);
      setJsonError(null);
      return true;
    } catch (error: any) {
      setJsonError(`JSON inválido: ${error.message}`);
      return false;
    }
  };

  const onSubmit = (data: ModeloFormValues) => {
    if (data.especificaciones_tecnicas && !validateJSON(data.especificaciones_tecnicas)) {
      toast.error('Las especificaciones técnicas contienen un JSON inválido');
      return;
    }

    const payload = {
      subcategoria_id: data.subcategoria_id,
      marca_id: data.marca_id,
      sku_id: data.sku_id || null,
      nombre: data.nombre,
      especificaciones_tecnicas:
        data.especificaciones_tecnicas && data.especificaciones_tecnicas.trim() !== ''
          ? JSON.parse(data.especificaciones_tecnicas)
          : null,
      activo: data.activo,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: modelo.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      crearMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  const handleJsonChange = (value: string, onChange: (value: string) => void) => {
    onChange(value);
    if (value.trim() !== '') {
      validateJSON(value);
    } else {
      setJsonError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Modelo' : 'Nuevo Modelo'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Subcategoría */}
            <FormField
              control={form.control}
              name="subcategoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoría *</FormLabel>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una subcategoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategorias?.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id.toString()}>
                          {sub.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marca */}
            <FormField
              control={form.control}
              name="marca_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca *</FormLabel>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {marcas?.map((marca) => (
                        <SelectItem key={marca.id} value={marca.id.toString()}>
                          {marca.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU con Combobox */}
            <FormField
              control={form.control}
              name="sku_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>SKU (Opcional)</FormLabel>
                  <div className="flex gap-2">
                    <Popover open={skuPopoverOpen} onOpenChange={setSkuPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={skuPopoverOpen}
                            className={cn(
                              'w-full justify-between font-normal bg-white hover:bg-gray-50',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <span className="truncate">
                              {field.value && skuSeleccionado
                                ? `${skuSeleccionado.codigo_sku} - ${skuSeleccionado.descripcion_sku}`
                                : 'Buscar SKU...'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0 bg-white" align="start">
                        <Command className="bg-white">
                          <CommandInput placeholder="Buscar por código o descripción..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>
                              {skusLoading ? 'Cargando SKUs...' : 'No se encontraron SKUs'}
                            </CommandEmpty>
                            <CommandGroup>
                              {skus.map((sku) => (
                                <CommandItem
                                  key={sku.id}
                                  value={`${sku.codigo_sku} ${sku.descripcion_sku}`}
                                  onSelect={() => {
                                    field.onChange(sku.id);
                                    setSkuPopoverOpen(false);
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      'h-4 w-4',
                                      field.value === sku.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-gray-900">
                                      {sku.descripcion_sku}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Código: {sku.codigo_sku}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => field.onChange(null)}
                        className="shrink-0 text-gray-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                  <FormLabel>Nombre del Modelo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: ProBook 440 G5, ThinkPad E15..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Especificaciones técnicas (JSON) */}
            <FormField
              control={form.control}
              name="especificaciones_tecnicas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especificaciones Técnicas (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`{\n  "procesador": "Intel Core i5",\n  "ram": "8GB",\n  "disco": "256GB SSD"\n}`}
                      className="font-mono text-sm min-h-[150px]"
                      value={field.value}
                      onChange={(e) => handleJsonChange(e.target.value, field.onChange)}
                    />
                  </FormControl>
                  {jsonError && (
                    <p className="text-sm text-red-600 mt-1">{jsonError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Formato JSON válido. Ejemplo: {`{"procesador": "Intel Core i5", "ram": "8GB"}`}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Modelo {field.value ? 'activo' : 'inactivo'}
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Botones */}
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
                disabled={crearMutation.isPending || updateMutation.isPending || !!jsonError}
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