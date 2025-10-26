/**
 * Modelo Categorias
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

export interface Categoria {
  id?: number;
  nombre: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface FiltrosCategoria extends PaginacionParams {
  activo?: boolean;
  nombre?: string;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nueva Categoria
 */
export const crearCategoria = async (categoria: Categoria): Promise<number> => {
  try {
    const query = `
      INSERT INTO categorias (nombre, activo)
      VALUES (?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      categoria.nombre,
      categoria.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El nombre de categoría ya existe');
    }
    throw error;
  }
};

/**
 * Listar Categorias con paginación y filtros
 */
export const listarCategorias = async (filtros: FiltrosCategoria = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['nombre', 'fecha_creacion', 'fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.nombre) {
    condiciones.push('nombre LIKE ?');
    valores.push(`%${filtros.nombre}%`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `SELECT COUNT(*) as total FROM categorias ${whereClause}`;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros
  const querySelect = `SELECT * FROM categorias ${whereClause} ORDER BY ${campo} ${direccion} LIMIT ${limit} OFFSET ${offset}`;
  const [categorias] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: categorias,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Categorias por nombre
 */
export const buscarCategorias = async (termino: string, filtros: PaginacionParams = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM categorias 
    WHERE nombre LIKE ? AND activo = true
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, [terminoBusqueda]);

  // Obtener registros
  const querySelect = `
    SELECT * FROM categorias
    WHERE nombre LIKE ? AND activo = true
    ORDER BY fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [categorias] = await pool.execute<RowDataPacket[]>(querySelect, [terminoBusqueda]);

  return {
    data: categorias,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Categoria por ID
 */
export const obtenerCategoriaPorId = async (id: number): Promise<Categoria | null> => {
  const [categorias] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categorias WHERE id = ?',
    [id]
  );

  return categorias.length > 0 ? (categorias[0] as Categoria) : null;
};

/**
 * Obtener Categoria por nombre
 */
export const obtenerCategoriaPorNombre = async (nombre: string): Promise<Categoria | null> => {
  const [categorias] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categorias WHERE nombre = ?',
    [nombre]
  );

  return categorias.length > 0 ? (categorias[0] as Categoria) : null;
};

/**
 * Actualizar Categoria
 */
export const actualizarCategoria = async (id: number, datos: Partial<Categoria>): Promise<boolean> => {
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

    const query = `UPDATE categorias SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El nombre de categoría ya existe');
    }
    throw error;
  }
};

/**
 * Soft delete de Categoria
 */
export const eliminarCategoria = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE categorias SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};