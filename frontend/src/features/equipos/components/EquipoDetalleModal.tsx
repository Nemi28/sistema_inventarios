import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Monitor,
  Hash,
  Tag,
  Building2,
  MapPin,
  User,
  Calendar,
  Shield,
  FileText,
  Package,
  Store,
  Cpu,
  History,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Equipo } from '../types';

interface EquipoDetalleModalProps {
  open: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  onViewHistory?: (equipo: Equipo) => void;
}

const getEstadoConfig = (estado: string) => {
  const config: Record<string, { color: string; text: string }> = {
    OPERATIVO: { color: 'bg-green-500', text: 'Operativo' },
    POR_VALIDAR: { color: 'bg-yellow-500', text: 'Por Validar' },
    EN_GARANTIA: { color: 'bg-blue-500', text: 'En Garantía' },
    INOPERATIVO: { color: 'bg-red-500', text: 'Inoperativo' },
    BAJA: { color: 'bg-gray-500', text: 'Baja' },
  };
  return config[estado] || { color: 'bg-gray-400', text: estado };
};

const getUbicacionConfig = (ubicacion: string) => {
  const config: Record<string, { color: string; text: string; icon: any }> = {
    ALMACEN: { color: 'bg-purple-500', text: 'Almacén', icon: Package },
    TIENDA: { color: 'bg-green-500', text: 'Tienda', icon: Store },
    PERSONA: { color: 'bg-blue-500', text: 'Persona', icon: User },
    EN_TRANSITO: { color: 'bg-orange-500', text: 'En Tránsito', icon: AlertCircle },
  };
  return config[ubicacion] || { color: 'bg-gray-400', text: ubicacion, icon: Package };
};

const InfoRow = ({ 
  icon: Icon, 
  label, 
  value, 
  mono = false,
  highlight = false 
}: { 
  icon: any; 
  label: string; 
  value?: string | null; 
  mono?: boolean;
  highlight?: boolean;
}) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'font-semibold text-primary' : 'text-gray-900'} break-words`}>
          {value}
        </p>
      </div>
    </div>
  );
};

export const EquipoDetalleModal = ({ 
  open, 
  onClose, 
  equipo,
  onViewHistory 
}: EquipoDetalleModalProps) => {
  if (!equipo) return null;

  const estadoConfig = getEstadoConfig(equipo.estado_actual);
  const ubicacionConfig = getUbicacionConfig(equipo.ubicacion_actual);
  const UbicacionIcon = ubicacionConfig.icon;

  const formatFecha = (fecha?: string) => {
    if (!fecha) return null;
    try {
      return format(new Date(fecha), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-purple-600" />
            Detalle del Equipo
          </DialogTitle>
        </DialogHeader>

        {/* Badges de estado y ubicación */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${estadoConfig.color} text-xs`}>
            {estadoConfig.text}
          </Badge>
          <Badge className={`${ubicacionConfig.color} text-xs flex items-center gap-1`}>
            <UbicacionIcon className="h-3 w-3" />
            {ubicacionConfig.text}
          </Badge>
          {equipo.tipo_propiedad && (
            <Badge variant="outline" className="text-xs">
              {equipo.tipo_propiedad === 'PROPIO' ? 'Propio' : 'Alquilado'}
            </Badge>
          )}
          {Boolean(equipo.garantia) && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
              <Shield className="h-3 w-3 mr-1" />
              Con Garantía
            </Badge>
          )}
          {Boolean(equipo.es_accesorio) && (
            <Badge variant="outline" className="text-xs">
              Accesorio
            </Badge>
          )}
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
          
          {/* Sección: Identificación */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Identificación</h4>
            <div className="grid grid-cols-2 gap-x-4">
              <InfoRow 
                icon={Tag} 
                label="Inv. Entel" 
                value={equipo.inv_entel} 
                mono 
                highlight 
              />
              <InfoRow 
                icon={Hash} 
                label="Número de Serie" 
                value={equipo.numero_serie} 
                mono 
              />
            </div>
          </div>

          {/* Sección: Clasificación */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Clasificación</h4>
            <div className="grid grid-cols-2 gap-x-4">
              <InfoRow 
                icon={Package} 
                label="Categoría" 
                value={equipo.categoria_nombre} 
              />
              <InfoRow 
                icon={Package} 
                label="Subcategoría" 
                value={equipo.subcategoria_nombre} 
              />
              <InfoRow 
                icon={Building2} 
                label="Marca" 
                value={equipo.marca_nombre} 
              />
              <InfoRow 
                icon={Monitor} 
                label="Modelo" 
                value={equipo.modelo_nombre} 
              />
            </div>
          </div>

          {/* Sección: Ubicación actual (condicional) */}
          {equipo.ubicacion_actual === 'TIENDA' && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <Store className="h-4 w-4" />
                Ubicación en Tienda
              </h4>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow 
                  icon={Store} 
                  label="Tienda" 
                  value={equipo.nombre_tienda} 
                />
                <InfoRow 
                  icon={Tag} 
                  label="PDV" 
                  value={equipo.pdv} 
                  mono 
                />
                <InfoRow 
                  icon={Cpu} 
                  label="Hostname" 
                  value={equipo.hostname} 
                  mono 
                />
                <InfoRow 
                  icon={MapPin} 
                  label="Posición" 
                  value={equipo.posicion_tienda} 
                />
                <InfoRow 
                  icon={MapPin} 
                  label="Área" 
                  value={equipo.area_tienda} 
                />
                <InfoRow 
                  icon={Building2} 
                  label="Socio" 
                  value={equipo.socio_nombre} 
                />
              </div>
              {(equipo.responsable_socio || equipo.responsable_entel) && (
                <>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-x-4">
                    <InfoRow 
                      icon={User} 
                      label="Responsable Socio" 
                      value={equipo.responsable_socio} 
                    />
                    <InfoRow 
                      icon={User} 
                      label="Responsable Entel" 
                      value={equipo.responsable_entel} 
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {equipo.ubicacion_actual === 'PERSONA' && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Asignado a Persona
              </h4>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow 
                  icon={User} 
                  label="Persona Asignada" 
                  value={equipo.persona_asignada} 
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Fecha Asignación" 
                  value={formatFecha(equipo.fecha_asignacion)} 
                />
                <InfoRow 
                  icon={FileText} 
                  label="Código de Acta" 
                  value={equipo.codigo_acta} 
                  mono 
                />
              </div>
            </div>
          )}

          {equipo.ubicacion_actual === 'ALMACEN' && equipo.ultima_ubicacion_origen && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                En Almacén
              </h4>
              <InfoRow 
                icon={MapPin} 
                label="Última Ubicación" 
                value={equipo.ultima_ubicacion_origen} 
              />
            </div>
          )}

          {/* Sección: Información Técnica */}
          {(equipo.sistema_operativo || equipo.equipo_principal_serie) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Información Técnica</h4>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow 
                  icon={Cpu} 
                  label="Sistema Operativo" 
                  value={equipo.sistema_operativo} 
                />
                {equipo.es_accesorio && (
                  <InfoRow 
                    icon={Monitor} 
                    label="Equipo Principal" 
                    value={equipo.equipo_principal_serie} 
                    mono 
                  />
                )}
              </div>
            </div>
          )}

          {/* Sección: Compra y Orden */}
          {(equipo.fecha_compra || equipo.orden_numero) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Adquisición</h4>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow 
                  icon={Calendar} 
                  label="Fecha de Compra" 
                  value={formatFecha(equipo.fecha_compra)} 
                />
                <InfoRow 
                  icon={FileText} 
                  label="Orden de Compra" 
                  value={equipo.orden_numero} 
                  mono 
                />
              </div>
            </div>
          )}

          {/* Sección: Observaciones */}
          {equipo.observaciones && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones
              </h4>
              <p className="text-sm text-gray-700">{equipo.observaciones}</p>
            </div>
          )}

          {/* Sección: Fechas del sistema */}
          <div className="text-xs text-gray-400 pt-2 border-t space-y-1">
            <p>Creado: {formatFecha(equipo.fecha_creacion)}</p>
            <p>Actualizado: {formatFecha(equipo.fecha_actualizacion)}</p>
          </div>
        </div>

        {/* Footer con botón de historial */}
        {onViewHistory && (
          <div className="flex-shrink-0 pt-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onClose();
                onViewHistory(equipo);
              }}
            >
              <History className="h-4 w-4 mr-2" />
              Ver Historial de Movimientos
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};