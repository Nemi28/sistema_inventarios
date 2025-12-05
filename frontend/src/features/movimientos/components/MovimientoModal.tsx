import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Check, Loader2, Cpu } from 'lucide-react';
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
import { useEquiposParaInstalacion } from '../hooks/useEquiposparaInstalacion';
import { CrearMovimientoRequest, TipoMovimiento, UbicacionMovimiento, InstalacionAccesorio } from '../types';
import { Equipo } from '@/features/equipos/types';
import { TiendaCombobox } from '@/components/common/TiendaCombobox';

interface MovimientoModalProps {
  open: boolean;
  onClose: () => void;
  equipos: Equipo[];
  ubicacionActual: UbicacionMovimiento;
}

const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string; descripcion: string }[] = [
  { value: 'SALIDA_ASIGNACION', label: 'Asignación', descripcion: 'Asignar equipo a tienda o persona' },
  { value: 'SALIDA_REEMPLAZO', label: 'Reemplazo', descripcion: 'Reemplazar equipo en tienda' },
  { value: 'SALIDA_PRESTAMO', label: 'Préstamo', descripcion: 'Préstamo temporal' },
  { value: 'RETORNO_TIENDA', label: 'Retorno de Tienda', descripcion: 'Devolver equipo desde tienda' },
  { value: 'RETORNO_PERSONA', label: 'Retorno de Persona', descripcion: 'Devolver equipo desde persona' },
  { value: 'TRANSFERENCIA_TIENDAS', label: 'Transferencia', descripcion: 'Transferir entre tiendas' },
];

export const MovimientoModal = ({ open, onClose, equipos, ubicacionActual }: MovimientoModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CrearMovimientoRequest>>({
    equipos_ids: equipos.map((e) => e.id),
    ubicacion_origen: ubicacionActual,
    estado_movimiento: 'EN_TRANSITO',
    fecha_salida: new Date().toISOString().split('T')[0],
  });
  const [instalacionesAccesorios, setInstalacionesAccesorios] = useState<InstalacionAccesorio[]>([]);

  const crearMovimientoMutation = useCrearMovimiento();
  const { data: tiendasData } = useTiendas({ limit: 1000 });
  const tiendas = tiendasData?.data || [];

  const { data: equiposEnTienda } = useEquiposParaInstalacion(
    formData.tienda_destino_id || 0,
    { enabled: !!formData.tienda_destino_id && formData.ubicacion_destino === 'TIENDA' }
  );

  const accesorios = useMemo(() => equipos.filter((e) => e.es_accesorio), [equipos]);
  const equiposNoAccesorios = useMemo(() => equipos.filter((e) => !e.es_accesorio), [equipos]);
  const hayAccesorios = accesorios.length > 0;
  const destinoEsTienda = formData.ubicacion_destino === 'TIENDA';
  const destinoEsPersona = formData.ubicacion_destino === 'PERSONA';
  const mostrarPasoInstalacion = hayAccesorios && (destinoEsTienda || destinoEsPersona);
  const totalSteps = mostrarPasoInstalacion ? 5 : 4;

  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({
        equipos_ids: equipos.map((e) => e.id),
        ubicacion_origen: ubicacionActual,
        estado_movimiento: 'EN_TRANSITO',
        fecha_salida: new Date().toISOString().split('T')[0],
      });
      setInstalacionesAccesorios([]);
    }
  }, [open, equipos, ubicacionActual]);

  useEffect(() => {
      if (hayAccesorios && destinoEsTienda && formData.tienda_destino_id) {
        setInstalacionesAccesorios(
          accesorios.map((acc) => ({ accesorio_id: acc.id, equipo_destino_id: 0 }))
        );
      }
          if (hayAccesorios && destinoEsPersona && formData.persona_destino) {
                  setInstalacionesAccesorios(
          accesorios.map((acc) => ({ accesorio_id: acc.id, equipo_destino_id: 0 }))
            );
          }
          }, [formData.tienda_destino_id, formData.persona_destino, hayAccesorios, destinoEsTienda, destinoEsPersona, accesorios]);

  const handleTipoMovimientoChange = (tipo: TipoMovimiento) => {
    let ubicacionDestino: UbicacionMovimiento = 'ALMACEN';
    if (tipo === 'SALIDA_ASIGNACION') ubicacionDestino = 'TIENDA';
    else if (tipo === 'RETORNO_TIENDA' || tipo === 'RETORNO_PERSONA') ubicacionDestino = 'ALMACEN';

    setFormData({
      ...formData,
      tipo_movimiento: tipo,
      ubicacion_destino: ubicacionDestino,
      tienda_destino_id: undefined,
      persona_destino: undefined,
    });
  };

  const handleDestinoChange = (destino: 'TIENDA' | 'PERSONA') => {
    setFormData({ ...formData, ubicacion_destino: destino, tienda_destino_id: undefined, persona_destino: undefined });
    setInstalacionesAccesorios([]);
  };

  const handleInstalacionChange = (accesorioId: number, equipoDestinoId: number) => {
    setInstalacionesAccesorios((prev) =>
      prev.map((inst) => inst.accesorio_id === accesorioId ? { ...inst, equipo_destino_id: equipoDestinoId } : inst)
    );
  };

  const handleSubmit = async () => {
    if (!formData.tipo_movimiento || !formData.ubicacion_destino) return;

    try {
      const instalacionesValidas = instalacionesAccesorios.filter((inst) => inst.equipo_destino_id > 0);
      await crearMovimientoMutation.mutateAsync({
        ...(formData as CrearMovimientoRequest),
        instalaciones_accesorios: instalacionesValidas.length > 0 ? instalacionesValidas : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error al crear movimiento:', error);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!formData.tipo_movimiento;
    if (step === 2) {
      if (formData.ubicacion_destino === 'TIENDA') return !!formData.tienda_destino_id;
      if (formData.ubicacion_destino === 'PERSONA') return !!formData.persona_destino && formData.persona_destino.trim().length >= 3;
      return true;
    }
    if (step === 3) return true;
    if (step === 4 && mostrarPasoInstalacion) {
        return instalacionesAccesorios.every((inst) => inst.equipo_destino_id > 0);
      }
    return true;
  };
  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Selecciona el tipo de movimiento</h3>
        <p className="text-sm text-gray-500 mb-2">
          {equipos.length} equipo(s) seleccionado(s) desde {ubicacionActual}
        </p>
        {hayAccesorios && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            <Cpu className="h-3 w-3 mr-1" />
            {accesorios.length} accesorio(s) incluido(s)
          </Badge>
        )}
      </div>

      <div className="grid gap-3">
        {TIPOS_MOVIMIENTO.map((tipo) => (
          <button
            key={tipo.value}
            type="button"
            onClick={() => handleTipoMovimientoChange(tipo.value)}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:border-blue-500 ${
              formData.tipo_movimiento === tipo.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{tipo.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{tipo.descripcion}</p>
              </div>
              {formData.tipo_movimiento === tipo.value && <Check className="h-5 w-5 text-blue-600" />}
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
        <p className="text-sm text-gray-500 mb-4">¿A dónde se moverán los equipos?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleDestinoChange('TIENDA')}
          className={`p-4 border-2 rounded-lg transition-all ${
            formData.ubicacion_destino === 'TIENDA' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
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
            formData.ubicacion_destino === 'PERSONA' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">Persona</div>
          </div>
        </button>
      </div>

      {formData.ubicacion_destino === 'TIENDA' && (
          <TiendaCombobox
            value={formData.tienda_destino_id}
            onChange={(value) => setFormData({ ...formData, tienda_destino_id: value })}
            label="Seleccionar Tienda"
            placeholder="Buscar tienda por nombre o PDV..."
            tiendas={tiendas}
            required
          />
        )}

      {formData.ubicacion_destino === 'PERSONA' && (
        <div>
          <Label htmlFor="persona">Nombre de la Persona *</Label>
          <Input
            id="persona"
            placeholder="Ej: Juan Pérez Gómez"
            value={formData.persona_destino || ''}
            onChange={(e) => setFormData({ ...formData, persona_destino: e.target.value })}
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
        <p className="text-sm text-gray-500 mb-4">Información opcional del movimiento</p>
      </div>

      <div>
        <Label htmlFor="fecha_salida">Fecha de Salida *</Label>
        <Input
          id="fecha_salida"
          type="date"
          value={formData.fecha_salida || ''}
          onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="ticket_helix">Ticket Helix</Label>
        <Input
          id="ticket_helix"
          placeholder="Ej: INC000123456"
          value={formData.ticket_helix || ''}
          onChange={(e) => setFormData({ ...formData, ticket_helix: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="motivo">Motivo</Label>
        <Input
          id="motivo"
          placeholder="Ej: Reemplazo de equipo defectuoso"
          value={formData.motivo || ''}
          onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          placeholder="Observaciones adicionales..."
          value={formData.observaciones || ''}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  const renderStepAccesorios = () => {
   

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-amber-600" />
            Instalación de Accesorios
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Indica en qué equipo se instalará cada accesorio
          </p>
        </div>

        <div className="space-y-4">
          {accesorios.map((accesorio) => {
            const instalacion = instalacionesAccesorios.find((i) => i.accesorio_id === accesorio.id);
            
            return (
              <div key={accesorio.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <Cpu className="h-3 w-3 mr-1" />
                    Accesorio
                  </Badge>
                  <span className="font-medium">{accesorio.subcategoria_nombre}</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm text-gray-600 font-mono">Serie: {accesorio.numero_serie || 'S/N'}</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm text-gray-600">{accesorio.inv_entel || accesorio.numero_serie}</span>
                </div>

                <div>
                  <Label className="text-sm">Instalar en equipo: *</Label>
                  <Select
                    value={instalacion?.equipo_destino_id?.toString() || ''}
                    onValueChange={(value) => handleInstalacionChange(accesorio.id, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equiposNoAccesorios.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100">
                            📦 Equipos en este envío
                          </div>
                          {equiposNoAccesorios.map((eq) => (
                            <SelectItem key={`envio-${eq.id}`} value={eq.id.toString()}>
                              {eq.categoria_nombre || 'EQUIPO'} | {eq.modelo_nombre} | Serie: {eq.numero_serie || 'S/N'}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {destinoEsTienda && equiposEnTienda && equiposEnTienda.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 mt-1">
                            🏪 Equipos ya en tienda
                          </div>
                          {equiposEnTienda.map((eq: any) => (
                            <SelectItem key={`tienda-${eq.id}`} value={eq.id.toString()}>
                              {eq.categoria_nombre || 'EQUIPO'} | {eq.modelo_nombre} | Serie: {eq.numero_serie || 'S/N'}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStepConfirmacion = () => {
    const tiendaSeleccionada = tiendas.find((t) => t.id === formData.tienda_destino_id);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Confirmar movimiento</h3>
          <p className="text-sm text-gray-500 mb-4">Revisa los detalles antes de confirmar</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-sm text-gray-600">Equipos a mover:</span>
            <p className="font-semibold">{equipos.length} equipo(s)</p>
            <div className="mt-2 space-y-1">
              {equipos.slice(0, 5).map((equipo) => (
                <div key={equipo.id} className="text-xs text-gray-600 flex items-center gap-1">
                  {equipo.es_accesorio ? <Cpu className="h-3 w-3 text-amber-500" /> : <span>•</span>}
                  {equipo.subcategoria_nombre || equipo.categoria_nombre} | {equipo.marca_nombre} | {equipo.modelo_nombre} | Serie: {equipo.numero_serie || 'S/N'}
                </div>
              ))}
              {equipos.length > 5 && (
                <div className="text-xs text-gray-500">... y {equipos.length - 5} más</div>
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
              <p className="font-semibold">🏪 {tiendaSeleccionada.nombre_tienda} ({tiendaSeleccionada.pdv})</p>
            )}
            {formData.ubicacion_destino === 'PERSONA' && (
              <p className="font-semibold">👤 {formData.persona_destino}</p>
            )}
            {formData.ubicacion_destino === 'ALMACEN' && (
              <p className="font-semibold">📦 Almacén</p>
            )}
          </div>

          {instalacionesAccesorios.filter((i) => i.equipo_destino_id > 0).length > 0 && (
            <div className="border-t pt-3">
              <span className="text-sm text-gray-600">Instalaciones de accesorios:</span>
              <div className="mt-1 space-y-1">
                {instalacionesAccesorios
                  .filter((i) => i.equipo_destino_id > 0)
                  .map((inst) => {
                    const accesorio = accesorios.find((a) => a.id === inst.accesorio_id);
                    const equipoDestino = [...equiposNoAccesorios, ...(equiposEnTienda || [])].find(
                      (e: any) => e.id === inst.equipo_destino_id
                    );
                    return (
                      <div key={inst.accesorio_id} className="text-xs text-gray-600">
                        <Cpu className="h-3 w-3 text-amber-500 inline mr-1" />
                        {accesorio?.subcategoria_nombre || accesorio?.categoria_nombre} | {accesorio?.modelo_nombre} | Serie: {accesorio?.numero_serie || 'S/N'} 
                        <span className="mx-1">→</span>
                        {(equipoDestino as any)?.categoria_nombre} | {(equipoDestino as any)?.modelo_nombre} | Serie: {(equipoDestino as any)?.numero_serie || 'S/N'}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {formData.ticket_helix && (
            <div className="border-t pt-3">
              <span className="text-sm text-gray-600">Ticket Helix:</span>
              <p className="font-semibold">{formData.ticket_helix}</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Nota:</strong> El código de acta se registrará cuando los equipos lleguen a su destino.
          </p>
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4 && mostrarPasoInstalacion) return renderStepAccesorios();
    return renderStepConfirmacion();
  };

  const isLastStep = step === totalSteps;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <Badge variant="outline">Paso {step} de {totalSteps}</Badge>
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="min-h-[400px]">{getStepContent()}</div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </Button>

          {!isLastStep ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={crearMovimientoMutation.isPending} className="gap-2">
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