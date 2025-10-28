import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Equipo, ESTADOS_EQUIPO } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EquipoDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipo: Equipo | null;
}

export const EquipoDetailModal = ({
  open,
  onOpenChange,
  equipo,
}: EquipoDetailModalProps) => {
  if (!equipo) return null;

  const estadoConfig = ESTADOS_EQUIPO.find((e) => e.value === equipo.estado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalle del Equipo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información Principal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{equipo.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marca</p>
                <p className="font-medium">{equipo.marca}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Modelo</p>
                <p className="font-medium">{equipo.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoría</p>
                <Badge variant="outline">{equipo.categoria_nombre}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Identificación */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Identificación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Número de Serie</p>
                <p className="font-mono text-sm">
                  {equipo.numero_serie || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Inventario ENTEL</p>
                <p className="font-medium">{equipo.inv_entel || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estado */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Estado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Estado del Equipo</p>
                <Badge
                  className={`${estadoConfig?.color || 'bg-gray-100 text-gray-800'}`}
                  variant="secondary"
                >
                  {estadoConfig?.label || equipo.estado}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado General</p>
                <Badge variant={equipo.activo ? 'default' : 'secondary'}>
                  {equipo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Orden de Compra */}
          {equipo.orden_compra_numero && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Orden de Compra</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Número de Orden</p>
                    <p className="font-medium">{equipo.orden_compra_numero}</p>
                  </div>
                  {equipo.orden_compra_fecha && (
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                      <p className="font-medium">
                        {format(new Date(equipo.orden_compra_fecha), 'dd/MM/yyyy', {
                          locale: es,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Observaciones */}
          {equipo.observacion && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Observaciones</h3>
                <p className="text-sm">{equipo.observacion}</p>
              </div>
            </>
          )}

          {/* Detalles Técnicos */}
          {equipo.detalle && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Detalles Técnicos</h3>
                <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(equipo.detalle, null, 2)}
                </pre>
              </div>
            </>
          )}

          {/* Fechas */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3">Información del Sistema</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha de Creación</p>
                <p>
                  {format(new Date(equipo.fecha_creacion), 'dd/MM/yyyy HH:mm', {
                    locale: es,
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Última Actualización</p>
                <p>
                  {format(
                    new Date(equipo.fecha_actualizacion),
                    'dd/MM/yyyy HH:mm',
                    {
                      locale: es,
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};