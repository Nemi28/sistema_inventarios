export interface ApiResponse<T = any> {
  success: boolean;
  mensaje?: string;
  data?: T;
  errores?: ValidationError[];
}

export interface ValidationError {
  msg: string;
  param: string;
  location: string;
}

export interface PaginationInfo {
  total: number;
  pagina_actual: number;
  total_paginas: number;
  registros_por_pagina: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  paginacion: PaginationInfo;
}