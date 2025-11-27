import { History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HistorialTimeline } from './HistorialTimeLine';
import { useHistorialEquipo } from '../hooks/useHistorialEquipo';
import { Equipo } from '@/features/equipos/types';

interface HistorialModalProps {
  open: boolean;
  onClose: () => void;
  equipo: Equipo | null;
}

export const HistorialModal = ({ open, onClose, equipo }: HistorialModalProps) => {
  const { data: movimientos, isLoading } = useHistorialEquipo(equipo?.id ?? null);

  if (!equipo) return null;

  const historial = movimientos || [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            Historial de Movimientos
          </DialogTitle>
        </DialogHeader>

        {/* Info del equipo */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 flex-shrink-0">
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
            <span className="text-sm font-mono">{equipo.numero_serie || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Inv. Entel:</span>
            <span className="text-sm font-mono font-semibold text-primary">
              {equipo.inv_entel || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ubicación actual:</span>
            <Badge variant="outline">{equipo.ubicacion_actual}</Badge>
          </div>
        </div>

        {/* Timeline con scroll */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <HistorialTimeline 
            movimientos={historial} 
            isLoading={isLoading} 
          />
        </div>

        {/* Footer con total */}
        {historial.length > 0 && (
          <div className="flex-shrink-0 pt-3 border-t text-center">
            <span className="text-sm text-gray-500">
              {historial.length} movimiento{historial.length !== 1 ? 's' : ''} registrado{historial.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};