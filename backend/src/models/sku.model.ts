/**
 * Modelo SKUs
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

export interface SKU {
  id?: number;
  codigo_sku: string;
  descripcion_sku: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface FiltrosSKU extends PaginacionParams {
  activo?: boolean;
  codigo_sku?: string;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nuevo SKU
 */
export const crearSKU = async (sku: SKU): Promise<number> => {
  try {
    const query = `
      INSERT INTO skus (codigo_sku, descripcion_sku, activo)
      VALUES (?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      sku.codigo_sku,
      sku.descripcion_sku,
      sku.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El código SKU ya existe');
    }
    throw error;
  }
};

/**
 * Listar SKUs con paginación y filtros
 */
export const listarSKUs = async (filtros: FiltrosSKU = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['codigo_sku', 'descripcion_sku', 'fecha_creacion', 'fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.codigo_sku) {
    condiciones.push('codigo_sku = ?');
    valores.push(filtros.codigo_sku);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `SELECT COUNT(*) as total FROM skus ${whereClause}`;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros - usando template literal para LIMIT y OFFSET
  const querySelect = `SELECT * FROM skus ${whereClause} ORDER BY ${campo} ${direccion} LIMIT ${limit} OFFSET ${offset}`;
  const [skus] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: skus,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar SKUs por código o descripción
 */
export const buscarSKUs = async (termino: string, filtros: PaginacionParams = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);

  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM skus 
    WHERE (codigo_sku LIKE ? OR descripcion_sku LIKE ?) AND activo = true
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, [
    terminoBusqueda,
    terminoBusqueda,
  ]);

  // Obtener registros
  const querySelect = `
    SELECT * FROM skus
    WHERE (codigo_sku LIKE ? OR descripcion_sku LIKE ?) AND activo = true
    ORDER BY fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [skus] = await pool.execute<RowDataPacket[]>(querySelect, [
    terminoBusqueda,
    terminoBusqueda,
  ]);

  return {
    data: skus,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener SKU por ID
 */
export const obtenerSKUPorId = async (id: number): Promise<SKU | null> => {
  const [skus] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM skus WHERE id = ?',
    [id]
  );

  return skus.length > 0 ? (skus[0] as SKU) : null;
};

/**
 * Obtener SKU por código
 */
export const obtenerSKUPorCodigo = async (codigo: string): Promise<SKU | null> => {
  const [skus] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM skus WHERE codigo_sku = ?',
    [codigo]
  );

  return skus.length > 0 ? (skus[0] as SKU) : null;
};

/**
 * Actualizar SKU
 */
export const actualizarSKU = async (id: number, datos: Partial<SKU>): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.codigo_sku !== undefined) {
      campos.push('codigo_sku = ?');
      valores.push(datos.codigo_sku);
    }

    if (datos.descripcion_sku !== undefined) {
      campos.push('descripcion_sku = ?');
      valores.push(datos.descripcion_sku);
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(id);

    const query = `UPDATE skus SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El código SKU ya existe');
    }
    throw error;
  }
};

/**
 * Soft delete de SKU
 */
export const eliminarSKU = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE skus SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};