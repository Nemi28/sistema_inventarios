/**
 * Modelo Modelos (equipos)
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

export interface Modelo {
  id?: number;
  subcategoria_id: number;
  marca_id: number;
  nombre: string;
  especificaciones_tecnicas?: any; // JSON
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  // Campos computados
  subcategoria_nombre?: string;
  marca_nombre?: string;
  categoria_nombre?: string;
  categoria_id?: number;
}

export interface FiltrosModelo extends PaginacionParams {
  activo?: boolean;
  nombre?: string;
  subcategoria_id?: number;
  marca_id?: number;
  categoria_id?: number;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nuevo Modelo
 */
export const crearModelo = async (modelo: Modelo): Promise<number> => {
  try {
    const query = `
      INSERT INTO modelos (subcategoria_id, marca_id, nombre, especificaciones_tecnicas, activo)
      VALUES (?, ?, ?, ?, ?)
    `;

    const especificacionesJSON = modelo.especificaciones_tecnicas 
      ? JSON.stringify(modelo.especificaciones_tecnicas) 
      : null;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      modelo.subcategoria_id,
      modelo.marca_id,
      modelo.nombre,
      especificacionesJSON,
      modelo.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un modelo con ese nombre para esta subcategoría y marca');
    }
    throw error;
  }
};

/**
 * Listar Modelos con paginación y filtros
 */
export const listarModelos = async (filtros: FiltrosModelo = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['m.nombre', 'm.fecha_creacion', 'm.fecha_actualizacion', 'ma.nombre', 's.nombre', 'c.nombre']
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

  if (filtros.subcategoria_id) {
    condiciones.push('m.subcategoria_id = ?');
    valores.push(filtros.subcategoria_id);
  }

  if (filtros.marca_id) {
    condiciones.push('m.marca_id = ?');
    valores.push(filtros.marca_id);
  }

  if (filtros.categoria_id) {
    condiciones.push('c.id = ?');
    valores.push(filtros.categoria_id);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `
    SELECT COUNT(*) as total 
    FROM modelos m
    INNER JOIN subcategorias s ON m.subcategoria_id = s.id
    INNER JOIN categorias c ON s.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    ${whereClause}
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros con información relacionada
  const querySelect = `
    SELECT 
      m.*,
      s.nombre as subcategoria_nombre,
      ma.nombre as marca_nombre,
      c.nombre as categoria_nombre,
      c.id as categoria_id
    FROM modelos m
    INNER JOIN subcategorias s ON m.subcategoria_id = s.id
    INNER JOIN categorias c ON s.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    ${whereClause}
    ORDER BY ${campo} ${direccion} 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [modelos] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  // Parsear especificaciones_tecnicas de JSON string a objeto
  const modelosParsed = modelos.map((modelo: any) => ({
    ...modelo,
    especificaciones_tecnicas: modelo.especificaciones_tecnicas 
      ? JSON.parse(modelo.especificaciones_tecnicas) 
      : null,
  }));

  return {
    data: modelosParsed,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Modelos por nombre
 */
export const buscarModelos = async (termino: string, filtros: FiltrosModelo = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const terminoBusqueda = `%${termino}%`;

  // Construir condiciones adicionales
  const condiciones: string[] = ['m.nombre LIKE ?', 'm.activo = true'];
  const valores: any[] = [terminoBusqueda];

  if (filtros.subcategoria_id) {
    condiciones.push('m.subcategoria_id = ?');
    valores.push(filtros.subcategoria_id);
  }

  if (filtros.marca_id) {
    condiciones.push('m.marca_id = ?');
    valores.push(filtros.marca_id);
  }

  if (filtros.categoria_id) {
    condiciones.push('c.id = ?');
    valores.push(filtros.categoria_id);
  }

  const whereClause = `WHERE ${condiciones.join(' AND ')}`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total 
    FROM modelos m
    INNER JOIN subcategorias s ON m.subcategoria_id = s.id
    INNER JOIN categorias c ON s.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    ${whereClause}
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);

  // Obtener registros
  const querySelect = `
    SELECT 
      m.*,
      s.nombre as subcategoria_nombre,
      ma.nombre as marca_nombre,
      c.nombre as categoria_nombre,
      c.id as categoria_id
    FROM modelos m
    INNER JOIN subcategorias s ON m.subcategoria_id = s.id
    INNER JOIN categorias c ON s.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    ${whereClause}
    ORDER BY m.fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [modelos] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  // Parsear especificaciones_tecnicas
  const modelosParsed = modelos.map((modelo: any) => ({
    ...modelo,
    especificaciones_tecnicas: modelo.especificaciones_tecnicas 
      ? JSON.parse(modelo.especificaciones_tecnicas) 
      : null,
  }));

  return {
    data: modelosParsed,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Modelo por ID
 */
export const obtenerModeloPorId = async (id: number): Promise<Modelo | null> => {
  const [modelos] = await pool.execute<RowDataPacket[]>(
    `SELECT 
      m.*,
      s.nombre as subcategoria_nombre,
      ma.nombre as marca_nombre,
      c.nombre as categoria_nombre,
      c.id as categoria_id
    FROM modelos m
    INNER JOIN subcategorias s ON m.subcategoria_id = s.id
    INNER JOIN categorias c ON s.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    WHERE m.id = ?`,
    [id]
  );

  if (modelos.length === 0) return null;

  const modelo = modelos[0];
  return {
    ...modelo,
    especificaciones_tecnicas: modelo.especificaciones_tecnicas 
      ? JSON.parse(modelo.especificaciones_tecnicas) 
      : null,
  } as Modelo;
};

/**
 * Verificar si existe modelo con ese nombre para esa subcategoría y marca
 */
export const existeModelo = async (
  nombre: string,
  subcategoriaId: number,
  marcaId: number,
  excludeId?: number
): Promise<boolean> => {
  let query = 'SELECT id FROM modelos WHERE nombre = ? AND subcategoria_id = ? AND marca_id = ?';
  const valores: any[] = [nombre, subcategoriaId, marcaId];

  if (excludeId) {
    query += ' AND id != ?';
    valores.push(excludeId);
  }

  const [modelos] = await pool.execute<RowDataPacket[]>(query, valores);

  return modelos.length > 0;
};

/**
 * Actualizar Modelo
 */
export const actualizarModelo = async (
  id: number,
  datos: Partial<Modelo>
): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.subcategoria_id !== undefined) {
      campos.push('subcategoria_id = ?');
      valores.push(datos.subcategoria_id);
    }

    if (datos.marca_id !== undefined) {
      campos.push('marca_id = ?');
      valores.push(datos.marca_id);
    }

    if (datos.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.especificaciones_tecnicas !== undefined) {
      campos.push('especificaciones_tecnicas = ?');
      valores.push(
        datos.especificaciones_tecnicas 
          ? JSON.stringify(datos.especificaciones_tecnicas) 
          : null
      );
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(id);

    const query = `UPDATE modelos SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un modelo con ese nombre para esta subcategoría y marca');
    }
    throw error;
  }
};

/**
 * Soft delete de Modelo
 */
export const eliminarModelo = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE modelos SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};

/**
 * Obtener modelos activos por subcategoría (sin paginación) - para selects
 */
export const obtenerModelosPorSubcategoria = async (
  subcategoriaId: number
): Promise<Modelo[]> => {
  const [modelos] = await pool.execute<RowDataPacket[]>(
    `SELECT 
      m.id, 
      m.nombre, 
      m.subcategoria_id,
      m.marca_id,
      ma.nombre as marca_nombre
     FROM modelos m
     INNER JOIN marcas ma ON m.marca_id = ma.id
     WHERE m.subcategoria_id = ? AND m.activo = true 
     ORDER BY m.nombre ASC`,
    [subcategoriaId]
  );

  return modelos as Modelo[];
};