/**
 * Modelo Socios
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

export interface Socio {
  id?: number;
  razon_social: string;
  ruc: string;
  direccion: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface FiltrosSocio extends PaginacionParams {
  activo?: boolean;
  razon_social?: string;
  ruc?: string;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nuevo Socio
 */
export const crearSocio = async (socio: Socio): Promise<number> => {
  try {
    const query = `
      INSERT INTO socio (razon_social, ruc, direccion, activo)
      VALUES (?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      socio.razon_social,
      socio.ruc,
      socio.direccion,
      socio.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('ruc')) {
        throw new Error('El RUC ya está registrado');
      }
      throw new Error('La razón social ya está registrada');
    }
    throw error;
  }
};

/**
 * Listar Socios con paginación y filtros
 */
export const listarSocios = async (filtros: FiltrosSocio = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['razon_social', 'ruc', 'direccion', 'fecha_creacion', 'fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.razon_social) {
    condiciones.push('razon_social LIKE ?');
    valores.push(`%${filtros.razon_social}%`);
  }

  if (filtros.ruc) {
    condiciones.push('ruc = ?');
    valores.push(filtros.ruc);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `SELECT COUNT(*) as total FROM socio ${whereClause}`;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros
  const querySelect = `SELECT * FROM socio ${whereClause} ORDER BY ${campo} ${direccion} LIMIT ${limit} OFFSET ${offset}`;
  const [socios] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: socios,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Socios por razón social o RUC
 */
export const buscarSocios = async (termino: string, filtros: PaginacionParams = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);

  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM socio 
    WHERE (razon_social LIKE ? OR ruc LIKE ?) AND activo = true
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, [
    terminoBusqueda,
    terminoBusqueda,
  ]);

  // Obtener registros
  const querySelect = `
    SELECT * FROM socio
    WHERE (razon_social LIKE ? OR ruc LIKE ?) AND activo = true
    ORDER BY fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [socios] = await pool.execute<RowDataPacket[]>(querySelect, [
    terminoBusqueda,
    terminoBusqueda,
  ]);

  return {
    data: socios,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Socio por ID
 */
export const obtenerSocioPorId = async (id: number): Promise<Socio | null> => {
  const [socios] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM socio WHERE id = ?',
    [id]
  );

  return socios.length > 0 ? (socios[0] as Socio) : null;
};

/**
 * Obtener Socio por RUC
 */
export const obtenerSocioPorRuc = async (ruc: string): Promise<Socio | null> => {
  const [socios] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM socio WHERE ruc = ?',
    [ruc]
  );

  return socios.length > 0 ? (socios[0] as Socio) : null;
};

/**
 * Actualizar Socio
 */
export const actualizarSocio = async (id: number, datos: Partial<Socio>): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.razon_social !== undefined) {
      campos.push('razon_social = ?');
      valores.push(datos.razon_social);
    }

    if (datos.ruc !== undefined) {
      campos.push('ruc = ?');
      valores.push(datos.ruc);
    }

    if (datos.direccion !== undefined) {
      campos.push('direccion = ?');
      valores.push(datos.direccion);
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(id);

    const query = `UPDATE socio SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('ruc')) {
        throw new Error('El RUC ya está registrado');
      }
      throw new Error('La razón social ya está registrada');
    }
    throw error;
  }
};

/**
 * Soft delete de Socio
 */
export const eliminarSocio = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE socio SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};