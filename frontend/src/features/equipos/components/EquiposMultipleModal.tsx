import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCreateEquiposMultiple } from '../hooks/useCreateEquiposMultiple';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { useOrdenesCompraActivas } from '@/features/ordenes_compra/hooks/useOrdenesCompraActivas';
import { ESTADOS_EQUIPO } from '../types';
import {
  equiposMultipleSchema,
  EquiposMultipleFormValues,
} from '@/lib/equipos-validations';
import { Textarea } from '@/components/ui/textarea';

interface EquiposMultipleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EquiposMultipleModal = ({
  open,
  onOpenChange,
}: EquiposMultipleModalProps) => {
  const [expandedItems, setExpandedItems] = useState<number[]>([0]);

  // Hooks
  const createMutation = useCreateEquiposMultiple();
  const { data: categoriasData } = useCategorias({ activo: true });

  const categorias = categoriasData?.data || [];

  const { data: ordenesData } = useOrdenesCompraActivas();
  const ordenesCompra = ordenesData?.data || [];

  // Form
  const form = useForm<EquiposMultipleFormValues>({
    resolver: zodResolver(equiposMultipleSchema),
    defaultValues: {
      equipos: [
        {
          categoria_id: 0,
          nombre: '',
          marca: '',
          modelo: '',
          numero_serie: '',
          inv_entel: '',
          estado: 'nuevo',
          observacion: '',
          activo: true,
          orden_compra_id: null,
          detalle: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'equipos',
  });

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const addEquipo = () => {
    if (fields.length < 50) {
      append({
        categoria_id: 0,
        nombre: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        inv_entel: '',
        estado: 'nuevo',
        observacion: '',
        activo: true,
        orden_compra_id: null,
        detalle: null,
      });
      setExpandedItems((prev) => [...prev, fields.length]);
    }
  };

  const removeEquipo = (index: number) => {
    remove(index);
    setExpandedItems((prev) => prev.filter((i) => i !== index));
  };

  const onSubmit = async (data: EquiposMultipleFormValues) => {
    const equiposLimpios = data.equipos.map((equipo) => ({
      ...equipo,
      numero_serie: equipo.numero_serie || null,
      inv_entel: equipo.inv_entel || null,
      observacion: equipo.observacion || null,
      detalle: equipo.detalle || null, 
    }));

    createMutation.mutate(equiposLimpios, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        setExpandedItems([0]);
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setExpandedItems([0]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Registro Múltiple de Equipos</span>
            <Badge variant="secondary">
              {fields.length} / 50 equipos
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 pb-4">
                {fields.map((field, index) => {
                  const isExpanded = expandedItems.includes(index);

                  return (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      {/* Header del equipo */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleExpand(index)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            Equipo #{index + 1}
                          </span>
                          {form.watch(`equipos.${index}.nombre`) && (
                            <span className="text-sm text-gray-500">
                              - {form.watch(`equipos.${index}.nombre`)}
                            </span>
                          )}
                        </button>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEquipo(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Formulario expandido */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {/* Categoría */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.categoria_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Categoría *</FormLabel>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(Number(value))
                                  }
                                  value={field.value?.toString() || ''}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categorias.map((cat) => (
                                      <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                      >
                                        {cat.nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Estado */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.estado`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {ESTADOS_EQUIPO.map((estado) => (
                                      <SelectItem
                                        key={estado.value}
                                        value={estado.value}
                                      >
                                        {estado.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Orden de Compra */}
<FormField
  control={form.control}
  name={`equipos.${index}.orden_compra_id`}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Orden de Compra</FormLabel>
      <Select
        onValueChange={(value) =>
          field.onChange(value === 'null' ? null : Number(value))
        }
        value={field.value?.toString() || 'null'}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Opcional" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="null">Sin orden</SelectItem>
          {ordenesCompra.map((orden) => (
            <SelectItem key={orden.id} value={orden.id.toString()}>
              {orden.numero_orden}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

                          {/* Nombre */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.nombre`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre del equipo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Marca */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.marca`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Marca *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Marca" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Modelo */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.modelo`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Modelo *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Modelo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Número de Serie */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.numero_serie`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>N° Serie</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Opcional"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Inventario ENTEL */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.inv_entel`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inv ENTEL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Opcional"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Observaciones */}
                          <FormField
                            control={form.control}
                            name={`equipos.${index}.observacion`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Observaciones</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Notas adicionales"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Detalle JSON - NUEVO CAMPO */}
<FormField
  control={form.control}
  name={`equipos.${index}.detalle`}
  render={({ field }) => (
    <FormItem className="md:col-span-2">
      <FormLabel>Detalle Técnico (JSON)</FormLabel>
      <FormControl>
        <Textarea
          placeholder='{"procesador": "Intel i7", "ram": "16GB"}'
          className="resize-none font-mono text-sm"
          rows={3}
          {...field}
          value={
            field.value 
              ? typeof field.value === 'string' 
                ? field.value 
                : JSON.stringify(field.value, null, 2)
              : ''
          }
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              field.onChange(null);
            } else {
              try {
                const parsed = JSON.parse(value);
                field.onChange(parsed);
              } catch {
                field.onChange(value);
              }
            }
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Botón Agregar Equipo */}
                {fields.length < 50 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEquipo}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Equipo ({fields.length}/50)
                  </Button>
                )}
              </div>
            </ScrollArea>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear {fields.length} Equipo{fields.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};