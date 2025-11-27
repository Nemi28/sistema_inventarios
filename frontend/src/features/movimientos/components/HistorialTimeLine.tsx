import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Package,
  Store,
  User,
  ArrowRight,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Movimiento, EstadoMovimiento, UbicacionMovimiento } from '../types';

interface HistorialTimelineProps {
  movimientos: Movimiento[];
  isLoading?: boolean;
}

const getIconoUbicacion = (ubicacion: UbicacionMovimiento) => {
  switch (ubicacion) {
    case 'ALMACEN':
      return <Package className="h-5 w-5" />;
    case 'TIENDA':
      return <Store className="h-5 w-5" />;
    case 'PERSONA':
      return <User className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const getColorEstado = (estado: EstadoMovimiento) => {
  switch (estado) {
    case 'COMPLETADO':
      return 'bg-green-500';
    case 'EN_TRANSITO':
      return 'bg-blue-500';
    case 'PENDIENTE':
      return 'bg-yellow-500';
    case 'CANCELADO':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getIconoEstado = (estado: EstadoMovimiento) => {
  switch (estado) {
    case 'COMPLETADO':
      return <CheckCircle className="h-4 w-4" />;
    case 'EN_TRANSITO':
      return <Clock className="h-4 w-4" />;
    case 'PENDIENTE':
      return <AlertCircle className="h-4 w-4" />;
    case 'CANCELADO':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getTipoMovimientoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    INGRESO_ALMACEN: 'Ingreso a Almacén',
    SALIDA_ASIGNACION: 'Asignación',
    SALIDA_REEMPLAZO: 'Reemplazo',
    SALIDA_PRESTAMO: 'Préstamo',
    RETORNO_TIENDA: 'Retorno de Tienda',
    RETORNO_PERSONA: 'Retorno de Persona',
    TRANSFERENCIA_TIENDAS: 'Transferencia entre Tiendas',
    CAMBIO_ESTADO: 'Cambio de Estado',
  };
  return labels[tipo] || tipo;
};

const getEstadoLabel = (estado: EstadoMovimiento) => {
  const labels: Record<EstadoMovimiento, string> = {
    COMPLETADO: 'Completado',
    EN_TRANSITO: 'En Tránsito',
    PENDIENTE: 'Pendiente',
    CANCELADO: 'Cancelado',
  };
  return labels[estado];
};

export const HistorialTimeline = ({ movimientos, isLoading }: HistorialTimelineProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No hay movimientos registrados para este equipo</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {movimientos.map((movimiento, index) => {
          const isFirst = index === 0;
          const fechaSalida = new Date(movimiento.fecha_salida);
          const fechaLlegada = movimiento.fecha_llegada
            ? new Date(movimiento.fecha_llegada)
            : null;

          return (
            <div key={movimiento.id} className="relative flex gap-4">
              {/* Icono circular con estado */}
              <div
                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getColorEstado(
                  movimiento.estado_movimiento
                )} text-white shadow-lg ${isFirst ? 'ring-4 ring-blue-100' : ''}`}
              >
                {getIconoEstado(movimiento.estado_movimiento)}
              </div>

              {/* Contenido */}
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {getTipoMovimientoLabel(movimiento.tipo_movimiento)}
                      {isFirst && (
                        <Badge variant="default" className="text-xs">
                          Actual
                        </Badge>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {format(fechaSalida, "d 'de' MMMM, yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </div>
                  </div>
                  <Badge
                    variant={
                      movimiento.estado_movimiento === 'COMPLETADO'
                        ? 'default'
                        : movimiento.estado_movimiento === 'EN_TRANSITO'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-xs"
                  >
                    {getEstadoLabel(movimiento.estado_movimiento)}
                  </Badge>
                </div>

                {/* Ubicaciones */}
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    {getIconoUbicacion(movimiento.ubicacion_origen)}
                    <span className="font-medium">
                      {movimiento.ubicacion_origen === 'TIENDA' && movimiento.tienda_origen_nombre
                        ? movimiento.tienda_origen_nombre
                        : movimiento.ubicacion_origen === 'PERSONA' && movimiento.persona_origen
                        ? movimiento.persona_origen
                        : movimiento.ubicacion_origen}
                    </span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-gray-400" />

                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    {getIconoUbicacion(movimiento.ubicacion_destino)}
                    <span>
                      {movimiento.ubicacion_destino === 'TIENDA' && movimiento.tienda_destino_nombre
                        ? movimiento.tienda_destino_nombre
                        : movimiento.ubicacion_destino === 'PERSONA' && movimiento.persona_destino
                        ? movimiento.persona_destino
                        : movimiento.ubicacion_destino}
                    </span>
                  </div>
                </div>

                {/* Detalles adicionales */}
                <div className="space-y-2">
                  {movimiento.codigo_acta && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Acta:</span>
                      <span className="font-mono font-semibold text-blue-600">
                        {movimiento.codigo_acta}
                      </span>
                    </div>
                  )}

                  {movimiento.ticket_helix && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Ticket:</span>
                      <span className="font-mono text-gray-900">{movimiento.ticket_helix}</span>
                    </div>
                  )}

                  {fechaLlegada && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>
                        Llegada:{' '}
                        {format(fechaLlegada, "d 'de' MMMM, yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  )}

                  {movimiento.motivo && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      <strong>Motivo:</strong> {movimiento.motivo}
                    </div>
                  )}

                  {movimiento.observaciones && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      <strong>Observaciones:</strong> {movimiento.observaciones}
                    </div>
                  )}

                  {movimiento.usuario_nombre && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t">
                      <User className="h-3 w-3" />
                      Registrado por: {movimiento.usuario_nombre}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};