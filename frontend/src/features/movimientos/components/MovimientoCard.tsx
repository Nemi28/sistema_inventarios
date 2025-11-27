import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Package,
  Store,
  User,
  ArrowRight,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Movimiento } from '../types';

interface MovimientoCardProps {
  movimiento: Movimiento;
}

const getIconoUbicacion = (ubicacion: string) => {
  switch (ubicacion) {
    case 'ALMACEN':
      return <Package className="h-4 w-4" />;
    case 'TIENDA':
      return <Store className="h-4 w-4" />;
    case 'PERSONA':
      return <User className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getColorEstado = (estado: string) => {
  switch (estado) {
    case 'COMPLETADO':
      return 'bg-green-500 text-white';
    case 'EN_TRANSITO':
      return 'bg-blue-500 text-white';
    case 'PENDIENTE':
      return 'bg-yellow-500 text-white';
    case 'CANCELADO':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getIconoEstado = (estado: string) => {
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

export const MovimientoCard = ({ movimiento }: MovimientoCardProps) => {
  const fechaSalida = new Date(movimiento.fecha_salida);
  const fechaLlegada = movimiento.fecha_llegada ? new Date(movimiento.fecha_llegada) : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getTipoMovimientoLabel(movimiento.tipo_movimiento)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              {format(fechaSalida, "d 'de' MMMM, yyyy", { locale: es })}
            </div>
          </div>
          <Badge className={`${getColorEstado(movimiento.estado_movimiento)} flex items-center gap-1`}>
            {getIconoEstado(movimiento.estado_movimiento)}
            {movimiento.estado_movimiento}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Equipo */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Equipo</div>
          <div className="font-mono font-semibold">
            {movimiento.equipo_inv_entel || movimiento.equipo_serie}
          </div>
          {movimiento.equipo_modelo && (
            <div className="text-sm text-gray-600">{movimiento.equipo_modelo}</div>
          )}
        </div>

        {/* Ubicaciones */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm flex-1">
            {getIconoUbicacion(movimiento.ubicacion_origen)}
            <div>
              <div className="text-xs text-gray-500">Origen</div>
              <div className="font-medium">
                {movimiento.ubicacion_origen === 'TIENDA' && movimiento.tienda_origen_nombre
                  ? movimiento.tienda_origen_nombre
                  : movimiento.ubicacion_origen === 'PERSONA' && movimiento.persona_origen
                  ? movimiento.persona_origen
                  : movimiento.ubicacion_origen}
              </div>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-gray-400" />

          <div className="flex items-center gap-2 text-sm flex-1">
            {getIconoUbicacion(movimiento.ubicacion_destino)}
            <div>
              <div className="text-xs text-gray-500">Destino</div>
              <div className="font-medium">
                {movimiento.ubicacion_destino === 'TIENDA' && movimiento.tienda_destino_nombre
                  ? movimiento.tienda_destino_nombre
                  : movimiento.ubicacion_destino === 'PERSONA' && movimiento.persona_destino
                  ? movimiento.persona_destino
                  : movimiento.ubicacion_destino}
              </div>
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-2 pt-2 border-t">
          {movimiento.codigo_acta && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Acta:</span>
              <span className="font-mono font-semibold text-blue-600">
                {movimiento.codigo_acta}
              </span>
            </div>
          )}

          {fechaLlegada && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                Llegada: {format(fechaLlegada, "d/MM/yyyy 'a las' HH:mm", { locale: es })}
              </span>
            </div>
          )}

          {movimiento.usuario_nombre && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              Por: {movimiento.usuario_nombre}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};