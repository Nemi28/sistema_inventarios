import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Warehouse, Loader2, AlertTriangle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCrearMovimiento } from '@/features/movimientos/hooks/useCrearMovimiento';
import { Equipo } from '@/features/equipos/types';
import { TipoMovimiento } from '@/features/movimientos/types';

interface RetornarAlmacenModalProps {
  open: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  tipoRetorno: 'TIENDA' | 'PERSONA';
}

export const RetornarAlmacenModal = ({
  open,
  onClose,
  equipo,
  tipoRetorno,
}: RetornarAlmacenModalProps) => {
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [ticketHelix, setTicketHelix] = useState('');

  const { mutate: crearMovimiento, isPending } = useCrearMovimiento();

  const handleConfirmar = () => {
    if (!equipo) return;

    const tipoMovimiento: TipoMovimiento = 
      tipoRetorno === 'TIENDA' ? 'RETORNO_TIENDA' : 'RETORNO_PERSONA';

    crearMovimiento(
      {
        equipos_ids: [equipo.id],
        tipo_movimiento: tipoMovimiento,
        ubicacion_origen: tipoRetorno,
        tienda_origen_id: tipoRetorno === 'TIENDA' ? equipo.tienda_id : undefined,
        persona_origen: tipoRetorno === 'PERSONA' ? equipo.persona_asignada : undefined,
        ubicacion_destino: 'ALMACEN',
        estado_movimiento: 'COMPLETADO', // Retorno es inmediato
        fecha_salida: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        fecha_llegada: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        motivo: motivo || `Retorno de ${tipoRetorno.toLowerCase()} a almacén`,
        observaciones: observaciones || undefined,
        ticket_helix: ticketHelix || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setMotivo('');
      setObservaciones('');
      setTicketHelix('');
      onClose();
    }
  };

  if (!equipo) return null;

  const origenTexto = tipoRetorno === 'TIENDA' 
    ? equipo.nombre_tienda 
    : equipo.persona_asignada;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-orange-600" />
            Retornar a Almacén
          </DialogTitle>
          <DialogDescription>
            El equipo será devuelto al almacén central
          </DialogDescription>
        </DialogHeader>

        {/* Info del equipo */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Equipo:</span>
            <span className="text-sm font-medium">{equipo.modelo_nombre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Marca:</span>
            <span className="text-sm">{equipo.marca_nombre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Serie:</span>
            <span className="text-sm font-mono">{equipo.numero_serie}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Inv. Entel:</span>
            <span className="text-sm font-mono font-semibold text-primary">
              {equipo.inv_entel}
            </span>
          </div>
        </div>

        {/* Movimiento visual */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="text-center">
            <Badge variant="outline" className="mb-1">
              {tipoRetorno === 'TIENDA' ? 'Tienda' : 'Persona'}
            </Badge>
            <p className="text-xs text-gray-600 max-w-[120px] truncate" title={origenTexto}>
              {origenTexto || '-'}
            </p>
          </div>
          <ArrowLeft className="h-5 w-5 text-orange-500 rotate-180" />
          <div className="text-center">
            <Badge className="bg-orange-500 mb-1">
              <Warehouse className="h-3 w-3 mr-1" />
              Almacén
            </Badge>
            <p className="text-xs text-gray-600">Central</p>
          </div>
        </div>

        {/* Campos opcionales */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="motivo" className="text-sm">
              Motivo del retorno
            </Label>
            <Input
              id="motivo"
              placeholder="Ej: Equipo defectuoso, fin de préstamo..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket" className="text-sm">
              Ticket Helix (opcional)
            </Label>
            <Input
              id="ticket"
              placeholder="Ej: INC000012345"
              value={ticketHelix}
              onChange={(e) => setTicketHelix(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observaciones" className="text-sm">
              Observaciones (opcional)
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Esta acción registrará el movimiento como <strong>COMPLETADO</strong> inmediatamente.
              El equipo quedará disponible en almacén.
            </p>
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
            type="button"
            onClick={handleConfirmar}
            disabled={isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Confirmar Retorno
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};