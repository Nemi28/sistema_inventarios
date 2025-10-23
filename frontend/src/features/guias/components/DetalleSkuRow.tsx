import { Control, useWatch } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { GuiaFormData } from '@/lib/validations';
import { Trash2, ChevronsUpDown, Check } from 'lucide-react';
import { useSKUsActivos } from '../hooks/useSKUsActivos';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DetalleSkuRowProps {
  index: number;
  control: Control<GuiaFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export const DetalleSkuRow = ({
  index,
  control,
  onRemove,
  canRemove,
}: DetalleSkuRowProps) => {
  const { data: skus = [], isLoading } = useSKUsActivos();
  const [open, setOpen] = useState(false);

  // Obtener el SKU seleccionado actual
  const skuIdSeleccionado = useWatch({
    control,
    name: `detalle.${index}.sku_id`,
  });

  const skuSeleccionado = skus.find((s) => s.id === skuIdSeleccionado);

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start border rounded-lg p-3 sm:p-4 bg-white">
      {/* Cantidad */}
      <div className="w-full sm:w-24">
        <FormField
          control={control}
          name={`detalle.${index}.cantidad`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* SKU (Combobox con búsqueda por descripción) */}
      <div className="flex-1 w-full sm:min-w-[300px]">
        <FormField
          control={control}
          name={`detalle.${index}.sku_id`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        'w-full justify-between font-normal bg-white hover:bg-gray-50',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <span className="truncate text-gray-900">
                        {field.value && skuSeleccionado
                          ? skuSeleccionado.descripcion_sku
                          : 'Buscar SKU por descripción...'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-white" align="start">
                  <Command className="bg-white">
                    <CommandInput
                      placeholder="Buscar por descripción..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isLoading
                          ? 'Cargando SKUs...'
                          : 'No se encontraron SKUs'}
                      </CommandEmpty>
                      <CommandGroup>
                        {skus.map((sku) => (
                          <CommandItem
                            key={sku.id}
                            value={sku.descripcion_sku}
                            onSelect={() => {
                              field.onChange(sku.id);
                              setOpen(false);
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Check
                              className={cn(
                                'h-4 w-4',
                                field.value === sku.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Serie */}
      <div className="flex-1 w-full sm:min-w-[200px]">
        <FormField
          control={control}
          name={`detalle.${index}.serie`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Serie (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Botón eliminar */}
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sm:hidden ml-2">Eliminar</span>
        </Button>
      )}
    </div>
  );
};