/**
 * Utilidades para Paginación
 * Sistema de Gestión de Inventarios
 */

export interface PaginacionParams {
  page?: number;
  limit?: number;
}

export interface PaginacionResultado {
  total: number;
  pagina_actual: number;
  total_paginas: number;
  registros_por_pagina: number;
}

/**
 * Calcula offset y limit para consultas SQL
 */
export const calcularPaginacion = (params: PaginacionParams) => {
  // Asegurar que siempre sean números válidos
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const offset = (page - 1) * limit;

  return { 
    page, 
    limit, 
    offset 
  };
};

/**
 * Genera objeto de respuesta de paginación
 */
export const generarPaginacion = (
  total: number,
  page: number,
  limit: number
): PaginacionResultado => {
  const total_paginas = Math.ceil(total / limit);

  return {
    total,
    pagina_actual: page,
    total_paginas,
    registros_por_pagina: limit,
  };
};

/**
 * Valida parámetros de ordenamiento
 */
export const validarOrdenamiento = (
  ordenar_por?: string,
  orden?: string,
  camposPermitidos: string[] = []
): { campo: string; direccion: 'ASC' | 'DESC' } => {
  const campo = camposPermitidos.includes(ordenar_por || '')
    ? ordenar_por!
    : 'fecha_creacion';
  
  const direccion = orden?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { campo, direccion };
};