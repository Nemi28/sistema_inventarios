export interface EquipoEntregado {
  equipo: string;
  marca: string;
  modelo: string;
  serie: string;
  inventario: string;
  hostname?: string;
  procesador?: string;
  disco?: string;
  ram?: string;
}

export interface EquipoRecojo extends EquipoEntregado {
  estado: 'OPERATIVO' | 'INOPERATIVO' | 'DAÑO FISICO';
}

export interface GenerarActaFormData {
  tipo_atencion: 'PRESTAMO' | 'REEMPLAZO' | 'ASIGNACION' | 'UPGRADE';
  usuario: string;
  ticket: string;
  email: string;
  area: string;
  cargo: string;
  fecha_inicio: string;
  fecha_fin: string;
  local_id: number;
  jefe_responsable: string;
  ing_soporte: string;
  equipos_entregados: EquipoEntregado[];
  observaciones_entregados?: string;
  equipos_recojo?: EquipoRecojo[];
  observaciones_recojo?: string;
}

export interface GenerarActaResponse {
  success: boolean;
  mensaje: string;
}

export const AREAS_OPTIONS = ['CAJA', 'VENTAS', 'ALMACEN'] as const;

export const CARGOS_OPTIONS = [
  'CONTROLLER',
  'SUPERVISOR TIENDA',
  'ASESOR INTEGRAL',
  'JEFE DE CLUSTER',
  'ASESOR DE BIENVENIDA',
] as const;

export const ING_SOPORTE_OPTIONS = ['E. PONCE', 'M. JARA', 'H. TORRES'] as const;

export const PROCESADOR_OPTIONS = ['Core i5', 'Core i7'] as const;

export const TIPO_ATENCION_OPTIONS = [
  { value: 'PRESTAMO', label: 'Préstamo' },
  { value: 'REEMPLAZO', label: 'Reemplazo' },
  { value: 'ASIGNACION', label: 'Asignación' },
  { value: 'UPGRADE', label: 'Upgrade' },
] as const;

export const ESTADO_EQUIPO_OPTIONS = [
  { value: 'OPERATIVO', label: 'Operativo' },
  { value: 'INOPERATIVO', label: 'Inoperativo' },
  { value: 'DAÑO FISICO', label: 'Daño Físico' },
] as const;