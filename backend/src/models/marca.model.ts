/**
 * Modelo Marcas
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

export interface Marca {
  id?: number;
  nombre: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface FiltrosMarca extends PaginacionParams {
  activo?: boolean;
  nombre?: string;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nueva Marca
 */
export const crearMarca = async (marca: Marca): Promise<number> => {
  try {
    const query = `
      INSERT INTO marcas (nombre, activo)
      VALUES (?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      marca.nombre,
      marca.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El nombre de marca ya existe');
    }
    throw error;
  }
};

/**
 * Listar Marcas con paginación y filtros
 */
export const listarMarcas = async (filtros: FiltrosMarca = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['m.nombre', 'm.fecha_creacion', 'm.fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('m.activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.nombre) {
    condiciones.push('m.nombre LIKE ?');
    valores.push(`%${filtros.nombre}%`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `
    SELECT COUNT(*) as total 
    FROM marcas m
    ${whereClause}
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros con conteo de modelos
  const querySelect = `
    SELECT 
      m.*,
      COUNT(mo.id) as total_modelos
    FROM marcas m
    LEFT JOIN modelos mo ON mo.marca_id = m.id AND mo.activo = true
    ${whereClause}
    GROUP BY m.id
    ORDER BY ${campo} ${direccion} 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [marcas] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: marcas,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Marcas por nombre
 */
export const buscarMarcas = async (termino: string, filtros: PaginacionParams = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM marcas 
    WHERE nombre LIKE ? AND activo = true
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, [terminoBusqueda]);

  // Obtener registros
  const querySelect = `
    SELECT 
      m.*,
      COUNT(mo.id) as total_modelos
    FROM marcas m
    LEFT JOIN modelos mo ON mo.marca_id = m.id AND mo.activo = true
    WHERE m.nombre LIKE ? AND m.activo = true
    GROUP BY m.id
    ORDER BY m.fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [marcas] = await pool.execute<RowDataPacket[]>(querySelect, [terminoBusqueda]);

  return {
    data: marcas,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Marca por ID
 */
export const obtenerMarcaPorId = async (id: number): Promise<Marca | null> => {
  const [marcas] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM marcas WHERE id = ?',
    [id]
  );

  return marcas.length > 0 ? (marcas[0] as Marca) : null;
};

/**
 * Obtener Marca por nombre
 */
export const obtenerMarcaPorNombre = async (nombre: string): Promise<Marca | null> => {
  const [marcas] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM marcas WHERE nombre = ?',
    [nombre]
  );

  return marcas.length > 0 ? (marcas[0] as Marca) : null;
};

/**
 * Actualizar Marca
 */
export const actualizarMarca = async (id: number, datos: Partial<Marca>): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(id);

    const query = `UPDATE marcas SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El nombre de marca ya existe');
    }
    throw error;
  }
};

/**
 * Soft delete de Marca
 */
export const eliminarMarca = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE marcas SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};

/**
 * Obtener todas las marcas activas (sin paginación) - para selects
 */
export const obtenerMarcasActivas = async (): Promise<Marca[]> => {
  const [marcas] = await pool.execute<RowDataPacket[]>(
    'SELECT id, nombre FROM marcas WHERE activo = true ORDER BY nombre ASC'
  );

  return marcas as Marca[];
};
/**
 * Obtener marcas que tienen modelos en una subcategoría específica
 */
export const obtenerMarcasPorSubcategoria = async (subcategoriaId: number): Promise<Marca[]> => {
  const [marcas] = await pool.execute<RowDataPacket[]>(
    `SELECT DISTINCT m.id, m.nombre 
     FROM marcas m
     INNER JOIN modelos mo ON mo.marca_id = m.id
     WHERE mo.subcategoria_id = ? AND m.activo = true AND mo.activo = true
     ORDER BY m.nombre ASC`,
    [subcategoriaId]
  );

  return marcas as Marca[];
};