export interface Equipo {
  id: number;
  orden_compra_id: number | null;
  categoria_id: number;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie: string | null;
  inv_entel: string | null;
  estado: 'nuevo' | 'operativo' | 'inoperativo' | 'perdido' | 'baja' | 'por validar' | 'otro';
  observacion: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Datos del JOIN
  categoria_nombre?: string;
  orden_compra_numero?: string;
  orden_compra_fecha?: string;
  detalle?: any; // JSON flexible
}

export interface EquipoFormData {
  orden_compra_id?: number | null;
  categoria_id: number;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie?: string | null;
  inv_entel?: string | null;
  estado: 'nuevo' | 'operativo' | 'inoperativo' | 'perdido' | 'baja' | 'por validar' | 'otro';
  observacion?: string | null;
  activo: boolean;
  detalle?: any;
}

export interface EquipoFilters {
  activo?: boolean;
  categoria_id?: number;
  orden_compra_id?: number;
  estado?: string;
  ordenar_por?: 'nombre' | 'marca' | 'modelo' | 'estado' | 'fecha_creacion';
  orden?: 'ASC' | 'DESC';
}

export const ESTADOS_EQUIPO = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-green-100 text-green-800' },
  { value: 'operativo', label: 'Operativo', color: 'bg-blue-100 text-blue-800' },
  { value: 'inoperativo', label: 'Inoperativo', color: 'bg-red-100 text-red-800' },
  { value: 'perdido', label: 'Perdido', color: 'bg-orange-100 text-orange-800' },
  { value: 'baja', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'por validar', label: 'Por Validar', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'otro', label: 'Otro', color: 'bg-slate-100 text-slate-800' },
] as const;

export type EstadoEquipo = typeof ESTADOS_EQUIPO[number]['value'];