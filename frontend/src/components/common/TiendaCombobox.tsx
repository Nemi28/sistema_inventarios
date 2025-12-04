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

interface Tienda {
  id: number;
  pdv: string;
  nombre_tienda: string;
  direccion?: string;
}

// Props cuando se usa con react-hook-form
interface TiendaComboboxFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  value?: never;
  onChange?: never;
}

// Props cuando se usa de forma standalone
interface TiendaComboboxStandaloneProps {
  control?: never;
  name?: never;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

// Props comunes
interface TiendaComboboxBaseProps {
  label?: string;
  description?: string;
  placeholder?: string;
  tiendas: Tienda[];
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
}

type TiendaComboboxProps<T extends FieldValues = FieldValues> = TiendaComboboxBaseProps &
  (TiendaComboboxFormProps<T> | TiendaComboboxStandaloneProps);

export function TiendaCombobox<T extends FieldValues = FieldValues>({
  control,
  name,
  value: standaloneValue,
  onChange: standaloneOnChange,
  label = 'Tienda',
  description,
  placeholder = 'Buscar tienda por nombre o PDV...',
  tiendas = [],
  isLoading = false,
  disabled = false,
  required = false,
}: TiendaComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  // Modo standalone (sin react-hook-form)
  if (standaloneOnChange !== undefined) {
    const tiendaSeleccionada = tiendas.find((t) => t.id === standaloneValue);

    return (
      <div className="flex flex-col space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-900">
            {label} {required && '*'}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'w-full justify-between font-normal bg-white hover:bg-gray-50',
                !standaloneValue && 'text-muted-foreground'
              )}
              disabled={isLoading || disabled}
            >
              <span className="truncate text-gray-900">
                {standaloneValue && tiendaSeleccionada
                  ? `${tiendaSeleccionada.pdv} - ${tiendaSeleccionada.nombre_tienda}`
                  : placeholder}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 bg-white" align="start">
            <Command className="bg-white">
              <CommandInput placeholder="Buscar por nombre o PDV..." className="h-9" />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? 'Cargando tiendas...' : 'No se encontraron tiendas'}
                </CommandEmpty>
                <CommandGroup>
                  {!required && standaloneValue && (
                    <CommandItem
                      value="__clear__"
                      onSelect={() => {
                        standaloneOnChange(undefined);
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
                      value={`${tienda.pdv} ${tienda.nombre_tienda} ${tienda.direccion || ''}`}
                      onSelect={() => {
                        standaloneOnChange(tienda.id);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4',
                          standaloneValue === tienda.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-gray-900">
                          {tienda.pdv} - {tienda.nombre_tienda}
                        </div>
                        {tienda.direccion && (
                          <div className="text-xs text-gray-600 truncate">
                            {tienda.direccion}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    );
  }

  // Modo react-hook-form
  return (
    <FormField
      control={control!}
      name={name!}
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
                  <CommandInput placeholder="Buscar por nombre o PDV..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? 'Cargando tiendas...' : 'No se encontraron tiendas'}
                    </CommandEmpty>
                    <CommandGroup>
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
                          value={`${tienda.pdv} ${tienda.nombre_tienda} ${tienda.direccion || ''}`}
                          onSelect={() => {
                            field.onChange(tienda.id);
                            setOpen(false);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'h-4 w-4',
                              field.value === tienda.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-gray-900">
                              {tienda.pdv} - {tienda.nombre_tienda}
                            </div>
                            {tienda.direccion && (
                              <div className="text-xs text-gray-600 truncate">
                                {tienda.direccion}
                              </div>
                            )}
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