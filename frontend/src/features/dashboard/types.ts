export interface DashboardStats {
  skus: {
    total: number;
    activos: number;
  };
  tiendas: {
    total: number;
    activos: number;
  };
  socios: {
    total: number;
    activos: number;
  };
  ordenes: {
    total: number;
    activos: number;
  };
  categorias: {
    total: number;
    activos: number;
  };
}

export interface ChartData {
  mes: string;
  mes_nombre: string;
  cantidad: number;
}

export interface TiendasPorSocio {
  socio: string;
  cantidad: number;
}

export interface UltimoSKU {
  codigo_sku: string;
  descripcion_sku: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface UltimaTienda {
  pdv: string;
  nombre_tienda: string;
  socio: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface UltimaOrden {
  numero_orden: string;
  detalle: string;
  fecha_ingreso: string;
  activo: boolean;
  fecha_creacion: string;
}