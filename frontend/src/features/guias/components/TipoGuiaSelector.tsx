import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GuiaFormData } from '@/lib/validations';
import { Package, PackageOpen } from 'lucide-react';

interface TipoGuiaSelectorProps {
  control: Control<GuiaFormData>;
}

export const TipoGuiaSelector = ({ control }: TipoGuiaSelectorProps) => {
  return (
    <FormField
      control={control}
      name="tipo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Guía *</FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-4"
            >
              <div
                className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  field.value === 'envio'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <RadioGroupItem value="envio" id="envio" className="sr-only" />
                <label
                  htmlFor="envio"
                  className="flex flex-1 items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      field.value === 'envio'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Envío</div>
                    <div className="text-sm text-gray-500">
                      Enviar equipos a tienda
                    </div>
                  </div>
                </label>
              </div>

              <div
                className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  field.value === 'recojo'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <RadioGroupItem
                  value="recojo"
                  id="recojo"
                  className="sr-only"
                />
                <label
                  htmlFor="recojo"
                  className="flex flex-1 items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      field.value === 'recojo'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <PackageOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Recojo</div>
                    <div className="text-sm text-gray-500">
                      Recoger equipos de tienda
                    </div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};