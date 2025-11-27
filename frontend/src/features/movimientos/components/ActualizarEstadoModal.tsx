import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CheckCircle, FileText, Calendar, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useActualizarEstado } from '../hooks/useActualizarEstado';
import { Movimiento, EstadoMovimiento } from '../types';

// Schema de validación
const actualizarEstadoSchema = z.object({
  codigo_acta: z
    .string()
    .min(1, 'El código de acta es requerido')
    .max(50, 'Máximo 50 caracteres'),
  fecha_llegada: z.string().min(1, 'La fecha de llegada es requerida'),
});

type ActualizarEstadoForm = z.infer<typeof actualizarEstadoSchema>;

interface ActualizarEstadoModalProps {
  open: boolean;
  onClose: () => void;
  movimiento: Movimiento | null;
}

export const ActualizarEstadoModal = ({
  open,
  onClose,
  movimiento,
}: ActualizarEstadoModalProps) => {
  const { mutate: actualizarEstado, isPending } = useActualizarEstado();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActualizarEstadoForm>({
    resolver: zodResolver(actualizarEstadoSchema),
    defaultValues: {
      codigo_acta: '',
      fecha_llegada: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (open && movimiento) {
      reset({
        codigo_acta: movimiento.codigo_acta || '',
        fecha_llegada: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [open, movimiento, reset]);

  const onSubmit = (data: ActualizarEstadoForm) => {
    if (!movimiento) return;

    actualizarEstado(
      {
        id: movimiento.id,
        data: {
          estado_movimiento: 'COMPLETADO' as EstadoMovimiento,
          fecha_llegada: data.fecha_llegada,
          codigo_acta: data.codigo_acta,
        },
      },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
      reset();
    }
  };

  if (!movimiento) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Recepción
          </DialogTitle>
          <DialogDescription>
            Marca el equipo como recibido y registra el código de acta
          </DialogDescription>
        </DialogHeader>

        {/* Info del equipo */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Equipo:</span>
            <span className="text-sm font-medium">{movimiento.equipo_modelo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Serie:</span>
            <span className="text-sm font-mono">{movimiento.equipo_serie}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Inv. Entel:</span>
            <span className="text-sm font-mono font-semibold text-primary">
              {movimiento.equipo_inv_entel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Destino:</span>
            <span className="text-sm font-medium">
              {movimiento.ubicacion_destino === 'TIENDA'
                ? movimiento.tienda_destino_nombre
                : movimiento.ubicacion_destino === 'PERSONA'
                ? movimiento.persona_destino
                : movimiento.ubicacion_destino}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Estado actual:</span>
            <Badge className="bg-blue-500 text-xs">En Tránsito</Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Código de Acta */}
          <div className="space-y-2">
            <Label htmlFor="codigo_acta" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Código de Acta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigo_acta"
              placeholder="Ej: ACTA-2024-001"
              {...register('codigo_acta')}
              className={errors.codigo_acta ? 'border-red-500' : ''}
            />
            {errors.codigo_acta && (
              <p className="text-xs text-red-500">{errors.codigo_acta.message}</p>
            )}
          </div>

          {/* Fecha de Llegada */}
          <div className="space-y-2">
            <Label htmlFor="fecha_llegada" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Llegada <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha_llegada"
              type="datetime-local"
              {...register('fecha_llegada')}
              className={errors.fecha_llegada ? 'border-red-500' : ''}
            />
            {errors.fecha_llegada && (
              <p className="text-xs text-red-500">{errors.fecha_llegada.message}</p>
            )}
          </div>

          {/* Nuevo estado */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                El estado cambiará a <strong>COMPLETADO</strong>
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Recepción
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};