import { useState } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
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
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TiendaComboboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  tiendas: any[];
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function TiendaCombobox<T extends FieldValues>({
  control,
  name,
  label = 'Tienda',
  description,
  placeholder = 'Buscar tienda por nombre o PDV...',
  tiendas = [],
  isLoading = false,
  disabled = false,
  required = false,
}: TiendaComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const tiendaSeleccionada = tiendas.find((t) => t.id === field.value);

        return (
          <FormItem className="flex flex-col">
            <FormLabel className="text-gray-900 font-semibold">
              {label} {required && '*'}
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
                    disabled={isLoading || disabled}
                  >
                    <span className="truncate text-gray-900">
                      {field.value && tiendaSeleccionada
                        ? `${tiendaSeleccionada.pdv} - ${tiendaSeleccionada.nombre_tienda}`
                        : placeholder}
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
                      {/* Opción para limpiar */}
                      {!required && field.value && (
                        <CommandItem
                          value="__clear__"
                          onSelect={() => {
                            field.onChange(undefined);
                            setOpen(false);
                          }}
                          className="flex items-center gap-2 cursor-pointer text-red-600"
                        >
                          <Check className="h-4 w-4 opacity-0" />
                          <span className="italic">Limpiar selección</span>
                        </CommandItem>
                      )}
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
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}