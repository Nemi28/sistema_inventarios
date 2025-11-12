import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useCambiarPassword } from '../hooks/useCambiarPassword';

const cambiarPasswordSchema = z
  .object({
    password_actual: z
      .string()
      .min(1, 'La contraseña actual es requerida'),
    password_nueva: z
      .string()
      .min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    password_confirmacion: z
      .string()
      .min(1, 'Debes confirmar la nueva contraseña'),
  })
  .refine((data) => data.password_nueva === data.password_confirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmacion'],
  });

type CambiarPasswordFormData = z.infer<typeof cambiarPasswordSchema>;

interface CambiarPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CambiarPasswordModal = ({
  open,
  onOpenChange,
}: CambiarPasswordModalProps) => {
  const cambiarMutation = useCambiarPassword();
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmacion: false,
  });

  const form = useForm<CambiarPasswordFormData>({
    resolver: zodResolver(cambiarPasswordSchema),
    defaultValues: {
      password_actual: '',
      password_nueva: '',
      password_confirmacion: '',
    },
  });

  const onSubmit = async (data: CambiarPasswordFormData) => {
    try {
      await cambiarMutation.mutateAsync({
        password_actual: data.password_actual,
        password_nueva: data.password_nueva,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error manejado en el hook
    }
  };

  const toggleShowPassword = (field: 'actual' | 'nueva' | 'confirmacion') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y elige una nueva contraseña segura.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Contraseña actual */}
            <FormField
              control={form.control}
              name="password_actual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Actual *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswords.actual ? 'text' : 'password'}
                        placeholder="Ingresa tu contraseña actual"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPassword('actual')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.actual ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nueva contraseña */}
            <FormField
              control={form.control}
              name="password_nueva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswords.nueva ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPassword('nueva')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.nueva ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmar contraseña */}
            <FormField
              control={form.control}
              name="password_confirmacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirmacion ? 'text' : 'password'}
                        placeholder="Repite la nueva contraseña"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPassword('confirmacion')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirmacion ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={cambiarMutation.isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={cambiarMutation.isPending}
                className="flex-1"
              >
                {cambiarMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};