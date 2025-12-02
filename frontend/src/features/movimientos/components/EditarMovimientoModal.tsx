import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Movimiento } from '../types';
import { actualizarMovimiento, cancelarMovimiento } from '../services/movimientos.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EditarMovimientoModalProps {
  open: boolean;
  onClose: () => void;
  movimiento: Movimiento | null;
}

const editarMovimientoSchema = z.object({
  codigo_acta: z.string().optional().or(z.literal('')),
  ticket_helix: z.string().optional().or(z.literal('')),
  fecha_salida: z.string().min(1, 'La fecha de salida es requerida'),
  fecha_llegada: z.string().optional().or(z.literal('')),
  estado_movimiento: z.enum(['PENDIENTE', 'EN_TRANSITO', 'COMPLETADO']),
  motivo: z.string().optional().or(z.literal('')),
  observaciones: z.string().optional().or(z.literal('')),
});

type EditarMovimientoFormValues = z.infer<typeof editarMovimientoSchema>;

const getTipoMovimientoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    INGRESO_ALMACEN: 'Ingreso a Almacén',
    SALIDA_ASIGNACION: 'Asignación',
    SALIDA_REEMPLAZO: 'Reemplazo',
    SALIDA_PRESTAMO: 'Préstamo',
    RETORNO_TIENDA: 'Retorno de Tienda',
    RETORNO_PERSONA: 'Retorno de Persona',
    TRANSFERENCIA_TIENDAS: 'Transferencia',
    CAMBIO_ESTADO: 'Cambio de Estado',
  };
  return labels[tipo] || tipo;
};

export const EditarMovimientoModal = ({
  open,
  onClose,
  movimiento,
}: EditarMovimientoModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const form = useForm<EditarMovimientoFormValues>({
    resolver: zodResolver(editarMovimientoSchema),
    defaultValues: {
      codigo_acta: '',
      ticket_helix: '',
      fecha_salida: '',
      fecha_llegada: '',
      estado_movimiento: 'PENDIENTE',
      motivo: '',
      observaciones: '',
    },
  });

  // Resetear form cuando cambia el movimiento
  useEffect(() => {
    if (movimiento && open) {
      form.reset({
        codigo_acta: movimiento.codigo_acta || '',
        ticket_helix: movimiento.ticket_helix || '',
        fecha_salida: movimiento.fecha_salida 
          ? format(new Date(movimiento.fecha_salida), 'yyyy-MM-dd') 
          : '',
        fecha_llegada: movimiento.fecha_llegada 
          ? format(new Date(movimiento.fecha_llegada), 'yyyy-MM-dd') 
          : '',
        estado_movimiento: movimiento.estado_movimiento === 'CANCELADO' 
          ? 'PENDIENTE' 
          : movimiento.estado_movimiento,
        motivo: movimiento.motivo || '',
        observaciones: movimiento.observaciones || '',
      });
    }
  }, [movimiento, open, form]);

  const onSubmit = async (data: EditarMovimientoFormValues) => {
    if (!movimiento) return;

    try {
      setIsLoading(true);
      await actualizarMovimiento(movimiento.id, {
        codigo_acta: data.codigo_acta || undefined,
        ticket_helix: data.ticket_helix || undefined,
        fecha_salida: data.fecha_salida,
        fecha_llegada: data.fecha_llegada || undefined,
        estado_movimiento: data.estado_movimiento,
        motivo: data.motivo || undefined,
        observaciones: data.observaciones || undefined,
      });
      toast.success('Movimiento actualizado correctamente');
      onClose();
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.error('Error al actualizar el movimiento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelarMovimiento = async () => {
    if (!movimiento) return;

    try {
      setIsCancelling(true);
      await cancelarMovimiento(movimiento.id);
      toast.success('Movimiento cancelado. El equipo fue devuelto a su ubicación origen.');
      setShowCancelConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error al cancelar:', error);
      toast.error('Error al cancelar el movimiento');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!movimiento) return null;

  const esCancelado = movimiento.estado_movimiento === 'CANCELADO';
  const puedeEditar = !esCancelado;
  const puedeCancelar = !esCancelado && movimiento.estado_movimiento !== 'COMPLETADO';

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <DialogTitle>Editar Movimiento</DialogTitle>
                <DialogDescription>
                  {getTipoMovimientoLabel(movimiento.tipo_movimiento)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Info del equipo */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Equipo:</span>
              <span className="font-medium">{movimiento.equipo_modelo} - {movimiento.equipo_marca}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Serie:</span>
              <span className="font-mono">{movimiento.equipo_serie || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Inv. Entel:</span>
              <span className="font-mono font-semibold text-primary">{movimiento.equipo_inv_entel || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Estado actual:</span>
              <Badge 
                className={
                  movimiento.estado_movimiento === 'COMPLETADO' ? 'bg-green-500' :
                  movimiento.estado_movimiento === 'EN_TRANSITO' ? 'bg-blue-500' :
                  movimiento.estado_movimiento === 'CANCELADO' ? 'bg-red-500' :
                  'bg-yellow-500'
                }
              >
                {movimiento.estado_movimiento}
              </Badge>
            </div>
          </div>

          {esCancelado ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 font-medium">Este movimiento está cancelado</p>
              <p className="text-red-600 text-sm mt-1">No se puede editar un movimiento cancelado</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Estado del movimiento */}
                <FormField
                  control={form.control}
                  name="estado_movimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Movimiento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                          <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
                          <SelectItem value="COMPLETADO">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Código Acta y Ticket Helix */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo_acta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Acta</FormLabel>
                        <FormControl>
                          <Input placeholder="ACTA-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ticket_helix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Helix</FormLabel>
                        <FormControl>
                          <Input placeholder="INC000123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fecha_salida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Salida *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fecha_llegada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Llegada</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Motivo */}
                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Razón del movimiento..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Observaciones */}
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  {puedeCancelar && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      Cancelar Movimiento
                    </Button>
                  )}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cerrar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmación de cancelación */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              ¿Cancelar este movimiento?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Esta acción:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Marcará el movimiento como <strong>CANCELADO</strong></li>
                <li>Devolverá el equipo a su <strong>ubicación de origen</strong></li>
                <li>Esta acción <strong>no se puede deshacer</strong></li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              No, mantener
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarMovimiento}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, cancelar movimiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};