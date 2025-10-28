/**
 * Modelo Órdenes de Compra
 * Sistema de Gestión de Inventarios
 */

import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  calcularPaginacion,
  generarPaginacion,
  validarOrdenamiento,
  PaginacionParams,
} from '../utils/pagination.utils';

export interface OrdenCompra {
  id?: number;
  numero_orden: string;
  detalle?: string | null;
  fecha_ingreso: Date | string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface FiltrosOrdenCompra extends PaginacionParams {
  activo?: boolean;
  numero_orden?: string;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nueva Orden de Compra
 */
export const crearOrdenCompra = async (ordenCompra: OrdenCompra): Promise<number> => {
  try {
    const query = `
      INSERT INTO ordenes_compra (numero_orden, detalle, fecha_ingreso, activo)
      VALUES (?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      ordenCompra.numero_orden,
      ordenCompra.detalle || null,
      ordenCompra.fecha_ingreso,
      ordenCompra.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El número de orden ya existe');
    }
    throw error;
  }
};

/**
 * Listar Órdenes de Compra con paginación y filtros
 */
export const listarOrdenesCompra = async (filtros: FiltrosOrdenCompra = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['numero_orden', 'fecha_ingreso', 'fecha_creacion', 'fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.numero_orden) {
    condiciones.push('numero_orden = ?');
    valores.push(filtros.numero_orden);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `SELECT COUNT(*) as total FROM ordenes_compra ${whereClause}`;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros
  const querySelect = `
    SELECT * FROM ordenes_compra 
    ${whereClause} 
    ORDER BY ${campo} ${direccion} 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [ordenes] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: ordenes,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Órdenes de Compra por número o detalle
 */
export const buscarOrdenesCompra = async (
  termino: string,
  filtros: PaginacionParams = {}
) => {
  const { page, limit, offset } = calcularPaginacion(filtros);

  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM ordenes_compra 
    WHERE (numero_orden LIKE ? OR detalle LIKE ?)
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, [
    terminoBusqueda,
    terminoBusqueda,
  ]);

  // Obtener registros
  const querySelect = `
    SELECT * FROM ordenes_compra
    WHERE (numero_orden LIKE ? OR detalle LIKE ?)
    ORDER BY fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [ordenes] = await pool.execute<RowDataPacket[]>(querySelect, [
    terminoBusqueda,
    terminoBusqueda,
  ]);

  return {
    data: ordenes,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Orden de Compra por ID
 */
export const obtenerOrdenCompraPorId = async (
  id: number
): Promise<OrdenCompra | null> => {
  const [ordenes] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ordenes_compra WHERE id = ?',
    [id]
  );

  return ordenes.length > 0 ? (ordenes[0] as OrdenCompra) : null;
};

/**
 * Obtener Orden de Compra por número
 */
export const obtenerOrdenCompraPorNumero = async (
  numeroOrden: string
): Promise<OrdenCompra | null> => {
  const [ordenes] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ordenes_compra WHERE numero_orden = ?',
    [numeroOrden]
  );

  return ordenes.length > 0 ? (ordenes[0] as OrdenCompra) : null;
};

/**
 * Actualizar Orden de Compra
 */
export const actualizarOrdenCompra = async (
  id: number,
  datos: Partial<OrdenCompra>
): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.numero_orden !== undefined) {
      campos.push('numero_orden = ?');
      valores.push(datos.numero_orden);
    }

    if (datos.detalle !== undefined) {
      campos.push('detalle = ?');
      valores.push(datos.detalle);
    }

    if (datos.fecha_ingreso !== undefined) {
      campos.push('fecha_ingreso = ?');
      valores.push(datos.fecha_ingreso);
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      return true;
    }

    valores.push(id);

    const query = `UPDATE ordenes_compra SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El número de orden ya existe');
    }
    throw error;
  }
};

/**
 * Soft delete de Orden de Compra
 */
export const eliminarOrdenCompra = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE ordenes_compra SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};

/**
 * Verificar si una orden tiene equipos asociados
 */
export const tieneEquiposAsociados = async (id: number): Promise<boolean> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM equipos WHERE orden_compra_id = ?',
    [id]
  );

  return rows[0].total > 0;
};