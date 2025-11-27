import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCrearMovimiento } from '../hooks/useCrearMovimiento';
import { useTiendas } from '@/features/tiendas/hooks/useTiendas';
import { CrearMovimientoRequest, TipoMovimiento, UbicacionMovimiento } from '../types';
import { Equipo } from '@/features/equipos/types';

interface MovimientoModalProps {
  open: boolean;
  onClose: () => void;
  equipos: Equipo[];
  ubicacionActual: UbicacionMovimiento;
}

const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string; descripcion: string }[] = [
  {
    value: 'SALIDA_ASIGNACION',
    label: 'Asignación',
    descripcion: 'Asignar equipo a tienda o persona',
  },
  {
    value: 'SALIDA_REEMPLAZO',
    label: 'Reemplazo',
    descripcion: 'Reemplazar equipo en tienda',
  },
  {
    value: 'SALIDA_PRESTAMO',
    label: 'Préstamo',
    descripcion: 'Préstamo temporal',
  },
  {
    value: 'RETORNO_TIENDA',
    label: 'Retorno de Tienda',
    descripcion: 'Devolver equipo desde tienda',
  },
  {
    value: 'RETORNO_PERSONA',
    label: 'Retorno de Persona',
    descripcion: 'Devolver equipo desde persona',
  },
  {
    value: 'TRANSFERENCIA_TIENDAS',
    label: 'Transferencia',
    descripcion: 'Transferir entre tiendas',
  },
];

export const MovimientoModal = ({ open, onClose, equipos, ubicacionActual }: MovimientoModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CrearMovimientoRequest>>({
    equipos_ids: equipos.map((e) => e.id),
    ubicacion_origen: ubicacionActual,
    estado_movimiento: 'EN_TRANSITO',
    fecha_salida: new Date().toISOString().split('T')[0],
  });

  const crearMovimientoMutation = useCrearMovimiento();
  const { data: tiendasData } = useTiendas({ limit: 1000 });
  const tiendas = tiendasData?.data || [];

  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({
        equipos_ids: equipos.map((e) => e.id),
        ubicacion_origen: ubicacionActual,
        estado_movimiento: 'EN_TRANSITO',
        fecha_salida: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, equipos, ubicacionActual]);

  const handleTipoMovimientoChange = (tipo: TipoMovimiento) => {
    let ubicacionDestino: UbicacionMovimiento = 'ALMACEN';

    if (tipo === 'SALIDA_ASIGNACION') {
      ubicacionDestino = 'TIENDA';
    } else if (tipo === 'RETORNO_TIENDA' || tipo === 'RETORNO_PERSONA') {
      ubicacionDestino = 'ALMACEN';
    }

    setFormData({
      ...formData,
      tipo_movimiento: tipo,
      ubicacion_destino: ubicacionDestino,
      tienda_destino_id: undefined,
      persona_destino: undefined,
    });
  };

  const handleDestinoChange = (destino: 'TIENDA' | 'PERSONA') => {
    setFormData({
      ...formData,
      ubicacion_destino: destino,
      tienda_destino_id: undefined,
      persona_destino: undefined,
    });
  };

  const handleSubmit = async () => {
    if (!formData.tipo_movimiento || !formData.ubicacion_destino) {
      return;
    }

    try {
      await crearMovimientoMutation.mutateAsync(formData as CrearMovimientoRequest);
      onClose();
    } catch (error) {
      console.error('Error al crear movimiento:', error);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!formData.tipo_movimiento;
    if (step === 2) {
      if (formData.ubicacion_destino === 'TIENDA') {
        return !!formData.tienda_destino_id;
      }
      if (formData.ubicacion_destino === 'PERSONA') {
        return !!formData.persona_destino && formData.persona_destino.trim().length >= 3;
      }
      return true;
    }
    if (step === 3) return true;
    return false;
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Selecciona el tipo de movimiento</h3>
        <p className="text-sm text-gray-500 mb-4">
          {equipos.length} equipo(s) seleccionado(s) desde {ubicacionActual}
        </p>
      </div>

      <div className="grid gap-3">
        {TIPOS_MOVIMIENTO.map((tipo) => (
          <button
            key={tipo.value}
            type="button"
            onClick={() => handleTipoMovimientoChange(tipo.value)}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:border-blue-500 ${
              formData.tipo_movimiento === tipo.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{tipo.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{tipo.descripcion}</p>
              </div>
              {formData.tipo_movimiento === tipo.value && (
                <Check className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Destino del movimiento</h3>
        <p className="text-sm text-gray-500 mb-4">
          ¿A dónde se moverán los equipos?
        </p>
      </div>

      {/* Selector de tipo de destino */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleDestinoChange('TIENDA')}
          className={`p-4 border-2 rounded-lg transition-all ${
            formData.ubicacion_destino === 'TIENDA'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🏪</div>
            <div className="font-semibold">Tienda</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleDestinoChange('PERSONA')}
          className={`p-4 border-2 rounded-lg transition-all ${
            formData.ubicacion_destino === 'PERSONA'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">Persona</div>
          </div>
        </button>
      </div>

      {/* Campos según destino */}
      {formData.ubicacion_destino === 'TIENDA' && (
        <div>
          <Label htmlFor="tienda">Seleccionar Tienda *</Label>
          <Select
            value={formData.tienda_destino_id?.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, tienda_destino_id: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una tienda" />
            </SelectTrigger>
            <SelectContent>
              {tiendas.map((tienda) => (
                <SelectItem key={tienda.id} value={tienda.id.toString()}>
                  {tienda.nombre_tienda} ({tienda.pdv})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.ubicacion_destino === 'PERSONA' && (
        <div>
          <Label htmlFor="persona">Nombre de la Persona *</Label>
          <Input
            id="persona"
            placeholder="Ej: Juan Pérez Gómez"
            value={formData.persona_destino || ''}
            onChange={(e) =>
              setFormData({ ...formData, persona_destino: e.target.value })
            }
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Detalles adicionales</h3>
        <p className="text-sm text-gray-500 mb-4">
          Información opcional del movimiento
        </p>
      </div>

      <div>
        <Label htmlFor="fecha_salida">Fecha de Salida *</Label>
        <Input
          id="fecha_salida"
          type="date"
          value={formData.fecha_salida || ''}
          onChange={(e) =>
            setFormData({ ...formData, fecha_salida: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="ticket_helix">Ticket Helix</Label>
        <Input
          id="ticket_helix"
          placeholder="Ej: INC000123456"
          value={formData.ticket_helix || ''}
          onChange={(e) =>
            setFormData({ ...formData, ticket_helix: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="motivo">Motivo</Label>
        <Input
          id="motivo"
          placeholder="Ej: Reemplazo de equipo defectuoso"
          value={formData.motivo || ''}
          onChange={(e) =>
            setFormData({ ...formData, motivo: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          placeholder="Observaciones adicionales..."
          value={formData.observaciones || ''}
          onChange={(e) =>
            setFormData({ ...formData, observaciones: e.target.value })
          }
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => {
    const tiendaSeleccionada = tiendas.find((t) => t.id === formData.tienda_destino_id);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Confirmar movimiento</h3>
          <p className="text-sm text-gray-500 mb-4">
            Revisa los detalles antes de confirmar
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-sm text-gray-600">Equipos a mover:</span>
            <p className="font-semibold">{equipos.length} equipo(s)</p>
            <div className="mt-2 space-y-1">
              {equipos.slice(0, 3).map((equipo) => (
                <div key={equipo.id} className="text-xs text-gray-600">
                  • {equipo.inv_entel || equipo.numero_serie} - {equipo.modelo_nombre}
                </div>
              ))}
              {equipos.length > 3 && (
                <div className="text-xs text-gray-500">
                  ... y {equipos.length - 3} más
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-3">
            <span className="text-sm text-gray-600">Tipo de movimiento:</span>
            <p className="font-semibold">
              {TIPOS_MOVIMIENTO.find((t) => t.value === formData.tipo_movimiento)?.label}
            </p>
          </div>

          <div className="border-t pt-3">
            <span className="text-sm text-gray-600">Destino:</span>
            {formData.ubicacion_destino === 'TIENDA' && tiendaSeleccionada && (
              <p className="font-semibold">
                🏪 {tiendaSeleccionada.nombre_tienda} ({tiendaSeleccionada.pdv})
              </p>
            )}
            {formData.ubicacion_destino === 'PERSONA' && (
              <p className="font-semibold">👤 {formData.persona_destino}</p>
            )}
            {formData.ubicacion_destino === 'ALMACEN' && (
              <p className="font-semibold">📦 Almacén</p>
            )}
          </div>

          {formData.ticket_helix && (
            <div className="border-t pt-3">
              <span className="text-sm text-gray-600">Ticket Helix:</span>
              <p className="font-semibold">{formData.ticket_helix}</p>
            </div>
          )}

          {formData.motivo && (
            <div className="border-t pt-3">
              <span className="text-sm text-gray-600">Motivo:</span>
              <p className="font-semibold">{formData.motivo}</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Nota:</strong> El código de acta se registrará cuando los equipos
            lleguen a su destino.
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <Badge variant="outline">
              Paso {step} de 4
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </Button>

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={crearMovimientoMutation.isPending}
              className="gap-2"
            >
              {crearMovimientoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Confirmar Movimiento
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};