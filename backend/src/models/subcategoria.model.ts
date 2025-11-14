/**
 * Modelo Subcategorías
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

export interface Subcategoria {
  id?: number;
  categoria_id: number;
  nombre: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  // Campos computados
  categoria_nombre?: string;
  total_modelos?: number;
}

export interface FiltrosSubcategoria extends PaginacionParams {
  activo?: boolean;
  nombre?: string;
  categoria_id?: number;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nueva Subcategoría
 */
export const crearSubcategoria = async (subcategoria: Subcategoria): Promise<number> => {
  try {
    const query = `
      INSERT INTO subcategorias (categoria_id, nombre, activo)
      VALUES (?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      subcategoria.categoria_id,
      subcategoria.nombre,
      subcategoria.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe una subcategoría con ese nombre en esta categoría');
    }
    throw error;
  }
};

/**
 * Listar Subcategorías con paginación y filtros
 */
export const listarSubcategorias = async (filtros: FiltrosSubcategoria = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['s.nombre', 's.fecha_creacion', 's.fecha_actualizacion', 'c.nombre']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('s.activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.nombre) {
    condiciones.push('s.nombre LIKE ?');
    valores.push(`%${filtros.nombre}%`);
  }

  if (filtros.categoria_id) {
    condiciones.push('s.categoria_id = ?');
    valores.push(filtros.categoria_id);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `
    SELECT COUNT(*) as total 
    FROM subcategorias s
    INNER JOIN categorias c ON s.categoria_id = c.id
    ${whereClause}
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros con información relacionada
  const querySelect = `
    SELECT 
      s.*,
      c.nombre as categoria_nombre,
      COUNT(m.id) as total_modelos
    FROM subcategorias s
    INNER JOIN categorias c ON s.categoria_id = c.id
    LEFT JOIN modelos m ON m.subcategoria_id = s.id AND m.activo = true
    ${whereClause}
    GROUP BY s.id
    ORDER BY ${campo} ${direccion} 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [subcategorias] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: subcategorias,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Subcategorías por nombre
 */
export const buscarSubcategorias = async (termino: string, filtros: FiltrosSubcategoria = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const terminoBusqueda = `%${termino}%`;

  // Construir condiciones adicionales
  const condiciones: string[] = ['s.nombre LIKE ?', 's.activo = true'];
  const valores: any[] = [terminoBusqueda];

  if (filtros.categoria_id) {
    condiciones.push('s.categoria_id = ?');
    valores.push(filtros.categoria_id);
  }

  const whereClause = `WHERE ${condiciones.join(' AND ')}`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total 
    FROM subcategorias s
    INNER JOIN categorias c ON s.categoria_id = c.id
    ${whereClause}
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);

  // Obtener registros
  const querySelect = `
    SELECT 
      s.*,
      c.nombre as categoria_nombre,
      COUNT(m.id) as total_modelos
    FROM subcategorias s
    INNER JOIN categorias c ON s.categoria_id = c.id
    LEFT JOIN modelos m ON m.subcategoria_id = s.id AND m.activo = true
    ${whereClause}
    GROUP BY s.id
    ORDER BY s.fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [subcategorias] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: subcategorias,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Subcategoría por ID
 */
export const obtenerSubcategoriaPorId = async (id: number): Promise<Subcategoria | null> => {
  const [subcategorias] = await pool.execute<RowDataPacket[]>(
    `SELECT 
      s.*,
      c.nombre as categoria_nombre
    FROM subcategorias s
    INNER JOIN categorias c ON s.categoria_id = c.id
    WHERE s.id = ?`,
    [id]
  );

  return subcategorias.length > 0 ? (subcategorias[0] as Subcategoria) : null;
};

/**
 * Verificar si existe subcategoría con ese nombre en esa categoría
 */
export const existeSubcategoria = async (
  nombre: string,
  categoriaId: number,
  excludeId?: number
): Promise<boolean> => {
  let query = 'SELECT id FROM subcategorias WHERE nombre = ? AND categoria_id = ?';
  const valores: any[] = [nombre, categoriaId];

  if (excludeId) {
    query += ' AND id != ?';
    valores.push(excludeId);
  }

  const [subcategorias] = await pool.execute<RowDataPacket[]>(query, valores);

  return subcategorias.length > 0;
};

/**
 * Actualizar Subcategoría
 */
export const actualizarSubcategoria = async (
  id: number,
  datos: Partial<Subcategoria>
): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.categoria_id !== undefined) {
      campos.push('categoria_id = ?');
      valores.push(datos.categoria_id);
    }

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

    const query = `UPDATE subcategorias SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe una subcategoría con ese nombre en esta categoría');
    }
    throw error;
  }
};

/**
 * Soft delete de Subcategoría
 */
export const eliminarSubcategoria = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE subcategorias SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};

/**
 * Obtener subcategorías activas por categoría (sin paginación) - para selects
 */
export const obtenerSubcategoriasPorCategoria = async (
  categoriaId: number
): Promise<Subcategoria[]> => {
  const [subcategorias] = await pool.execute<RowDataPacket[]>(
    `SELECT id, nombre, categoria_id 
     FROM subcategorias 
     WHERE categoria_id = ? AND activo = true 
     ORDER BY nombre ASC`,
    [categoriaId]
  );

  return subcategorias as Subcategoria[];
};