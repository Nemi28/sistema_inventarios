import { Control, useWatch } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
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
import { ChevronsUpDown, Check } from 'lucide-react';
import { useTiendasActivas } from '../hooks/useTiendasActivas';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TiendaComboboxProps {
  control: Control<GuiaFormData>;
  tipo: 'envio' | 'recojo';
}

export const TiendaCombobox = ({ control, tipo }: TiendaComboboxProps) => {
  const { data: tiendas = [], isLoading } = useTiendasActivas();
  const [open, setOpen] = useState(false);

  // Obtener la tienda seleccionada actual
  const tiendaIdSeleccionada = useWatch({
    control,
    name: 'tienda_id',
  });

  const tiendaSeleccionada = tiendas.find((t) => t.id === tiendaIdSeleccionada);

  return (
    <FormField
      control={control}
      name="tienda_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-gray-900 font-semibold">
            {tipo === 'envio' ? 'Tienda Destino *' : 'Tienda Origen *'}
          </FormLabel>
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
                  disabled={isLoading}
                >
                  <span className="truncate text-gray-900">
                    {field.value && tiendaSeleccionada
                      ? `${tiendaSeleccionada.pdv} - ${tiendaSeleccionada.nombre_tienda}`
                      : 'Buscar tienda por nombre o PDV...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-white" align="start">
              <Command className="bg-white">
                <CommandInput
                  placeholder="Buscar por nombre o PDV..."
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoading
                      ? 'Cargando tiendas...'
                      : 'No se encontraron tiendas'}
                  </CommandEmpty>
                  <CommandGroup>
                    {tiendas.map((tienda) => (
                      <CommandItem
                        key={tienda.id}
                        value={`${tienda.pdv} ${tienda.nombre_tienda} ${tienda.direccion}`}
                        onSelect={() => {
                          field.onChange(tienda.id);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Check
                          className={cn(
                            'h-4 w-4',
                            field.value === tienda.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-gray-900">
                            {tienda.pdv} - {tienda.nombre_tienda}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {tienda.direccion}
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
  );
};