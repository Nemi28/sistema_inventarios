/**
 * Modelo Equipos
 * Sistema de Gestión de Inventarios
 */

import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import {
  calcularPaginacion,
  generarPaginacion,
  validarOrdenamiento,
  PaginacionParams,
} from '../utils/pagination.utils';

export interface Equipo {
  id?: number;
  orden_compra_id?: number | null;
  categoria_id: number;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie?: string | null;
  inv_entel?: string | null;
  estado: 'nuevo' | 'operativo' | 'inoperativo' | 'perdido' | 'baja' | 'por validar' | 'otro';
  observacion?: string | null;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface DetalleEquipo {
  id?: number;
  equipo_id: number;
  detalle: any; // JSON flexible
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface EquipoCompleto extends Equipo {
  detalle?: any;
  categoria_nombre?: string;
  orden_compra_numero?: string;
}

export interface EquipoConRelaciones extends Equipo {
  categoria_nombre?: string;
  orden_compra_numero?: string;
  orden_compra_fecha?: Date;
  detalle?: any;
}

export interface FiltrosEquipo extends PaginacionParams {
  activo?: boolean;
  categoria_id?: number;
  orden_compra_id?: number;
  estado?: string;
  ordenar_por?: string;
  orden?: string;
}

export interface EquipoParaCrear extends Equipo {
  detalle?: any;
}

/**
 * Crear nuevo Equipo (individual)
 */
export const crearEquipo = async (equipo: EquipoParaCrear): Promise<number> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insertar equipo
    const queryEquipo = `
      INSERT INTO equipos (
        orden_compra_id, categoria_id, nombre, marca, modelo, 
        numero_serie, inv_entel, estado, observacion, activo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultadoEquipo] = await connection.execute<ResultSetHeader>(queryEquipo, [
      equipo.orden_compra_id ?? null,
      equipo.categoria_id,
      equipo.nombre,
      equipo.marca,
      equipo.modelo,
      equipo.numero_serie ?? null,
      equipo.inv_entel ?? null,
      equipo.estado,
      equipo.observacion ?? null,
      equipo.activo ?? true,
    ]);

    const equipoId = resultadoEquipo.insertId;

    // Insertar detalle si existe
    if (equipo.detalle) {
      const queryDetalle = `
        INSERT INTO detalles_equipos (equipo_id, detalle)
        VALUES (?, ?)
      `;
      
      await connection.execute(queryDetalle, [
        equipoId,
        JSON.stringify(equipo.detalle),
      ]);
    }

    await connection.commit();
    return equipoId;

  } catch (error: any) {
    await connection.rollback();
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.message.includes('categoria_id')) {
        throw new Error('La categoría especificada no existe');
      }
      if (error.message.includes('orden_compra_id')) {
        throw new Error('La orden de compra especificada no existe');
      }
    }
    
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Crear múltiples Equipos (registro masivo con transacción)
 */
export const crearEquiposMultiple = async (equipos: EquipoParaCrear[]): Promise<number[]> => {
  const connection = await pool.getConnection();
  const equiposCreados: number[] = [];

  try {
    await connection.beginTransaction();

    for (const equipo of equipos) {
      // Insertar equipo
      const queryEquipo = `
        INSERT INTO equipos (
          orden_compra_id, categoria_id, nombre, marca, modelo, 
          numero_serie, inv_entel, estado, observacion, activo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [resultadoEquipo] = await connection.execute<ResultSetHeader>(queryEquipo, [
        equipo.orden_compra_id ?? null,
        equipo.categoria_id,
        equipo.nombre,
        equipo.marca,
        equipo.modelo,
        equipo.numero_serie ?? null,
        equipo.inv_entel ?? null,
        equipo.estado,
        equipo.observacion ?? null,
        equipo.activo ?? true,
      ]);

      const equipoId = resultadoEquipo.insertId;
      equiposCreados.push(equipoId);

      // Insertar detalle si existe
      if (equipo.detalle) {
        const queryDetalle = `
          INSERT INTO detalles_equipos (equipo_id, detalle)
          VALUES (?, ?)
        `;
        
        await connection.execute(queryDetalle, [
          equipoId,
          JSON.stringify(equipo.detalle),
        ]);
      }
    }

    await connection.commit();
    return equiposCreados;

  } catch (error: any) {
    await connection.rollback();
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.message.includes('categoria_id')) {
        throw new Error('Una o más categorías especificadas no existen');
      }
      if (error.message.includes('orden_compra_id')) {
        throw new Error('Una o más órdenes de compra especificadas no existen');
      }
    }
    
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Listar Equipos con paginación y filtros
 */
export const listarEquipos = async (filtros: FiltrosEquipo = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['nombre', 'marca', 'modelo', 'estado', 'inv_entel', 'fecha_creacion', 'fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('e.activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.categoria_id) {
    condiciones.push('e.categoria_id = ?');
    valores.push(filtros.categoria_id);
  }

  if (filtros.orden_compra_id) {
    condiciones.push('e.orden_compra_id = ?');
    valores.push(filtros.orden_compra_id);
  }

  if (filtros.estado) {
    condiciones.push('e.estado = ?');
    valores.push(filtros.estado);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `SELECT COUNT(*) as total FROM equipos e ${whereClause}`;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros con JOINs
  const querySelect = `
    SELECT 
      e.*,
      c.nombre as categoria_nombre,
      oc.numero_orden as orden_compra_numero,
      oc.fecha_ingreso as orden_compra_fecha,
      de.detalle as detalle
    FROM equipos e
    INNER JOIN categorias c ON e.categoria_id = c.id
    LEFT JOIN ordenes_compra oc ON e.orden_compra_id = oc.id
    LEFT JOIN detalles_equipos de ON e.id = de.equipo_id
    ${whereClause} 
    ORDER BY e.${campo} ${direccion} 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [equipos] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: equipos,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Equipos por nombre, marca, modelo, número de serie o inv_entel
 */
export const buscarEquipos = async (termino: string, filtros: PaginacionParams = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);

  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM equipos e
    WHERE (
      e.nombre LIKE ? OR 
      e.marca LIKE ? OR 
      e.modelo LIKE ? OR 
      e.numero_serie LIKE ? OR 
      e.inv_entel LIKE ?
    ) AND e.activo = true
  `;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, [
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
  ]);

  // Obtener registros
  const querySelect = `
    SELECT 
      e.*,
      c.nombre as categoria_nombre,
      oc.numero_orden as orden_compra_numero,
      oc.fecha_ingreso as orden_compra_fecha,
      de.detalle as detalle
    FROM equipos e
    INNER JOIN categorias c ON e.categoria_id = c.id
    LEFT JOIN ordenes_compra oc ON e.orden_compra_id = oc.id
    LEFT JOIN detalles_equipos de ON e.id = de.equipo_id
    WHERE (
      e.nombre LIKE ? OR 
      e.marca LIKE ? OR 
      e.modelo LIKE ? OR 
      e.numero_serie LIKE ? OR 
      e.inv_entel LIKE ?
    ) AND e.activo = true
    ORDER BY e.fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [equipos] = await pool.execute<RowDataPacket[]>(querySelect, [
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
  ]);

  return {
    data: equipos,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Equipo por ID
 */
export const obtenerEquipoPorId = async (id: number): Promise<EquipoConRelaciones | null> => {
  const query = `
    SELECT 
      e.*,
      c.nombre as categoria_nombre,
      oc.numero_orden as orden_compra_numero,
      oc.fecha_ingreso as orden_compra_fecha,
      de.detalle as detalle
    FROM equipos e
    INNER JOIN categorias c ON e.categoria_id = c.id
    LEFT JOIN ordenes_compra oc ON e.orden_compra_id = oc.id
    LEFT JOIN detalles_equipos de ON e.id = de.equipo_id
    WHERE e.id = ?
  `;
  
  const [equipos] = await pool.execute<RowDataPacket[]>(query, [id]);

  return equipos.length > 0 ? (equipos[0] as EquipoConRelaciones) : null;
};

/**
 * Verificar si existe una Categoría por ID
 */
export const existeCategoriaPorId = async (categoriaId: number): Promise<boolean> => {
  const [categorias] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM categorias WHERE id = ?',
    [categoriaId]
  );

  return categorias[0].count > 0;
};

/**
 * Verificar si existe una Orden de Compra por ID
 */
export const existeOrdenCompraPorId = async (ordenId: number): Promise<boolean> => {
  const [ordenes] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM ordenes_compra WHERE id = ?',
    [ordenId]
  );

  return ordenes[0].count > 0;
};

/**
 * Actualizar Equipo
 */
export const actualizarEquipo = async (
  id: number, 
  datos: Partial<EquipoParaCrear>
): Promise<boolean> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Actualizar tabla equipos
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.orden_compra_id !== undefined) {
      campos.push('orden_compra_id = ?');
      valores.push(datos.orden_compra_id);
    }

    if (datos.categoria_id !== undefined) {
      campos.push('categoria_id = ?');
      valores.push(datos.categoria_id);
    }

    if (datos.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.marca !== undefined) {
      campos.push('marca = ?');
      valores.push(datos.marca);
    }

    if (datos.modelo !== undefined) {
      campos.push('modelo = ?');
      valores.push(datos.modelo);
    }

    if (datos.numero_serie !== undefined) {
      campos.push('numero_serie = ?');
      valores.push(datos.numero_serie);
    }

    if (datos.inv_entel !== undefined) {
      campos.push('inv_entel = ?');
      valores.push(datos.inv_entel);
    }

    if (datos.estado !== undefined) {
      campos.push('estado = ?');
      valores.push(datos.estado);
    }

    if (datos.observacion !== undefined) {
      campos.push('observacion = ?');
      valores.push(datos.observacion);
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length > 0) {
      valores.push(id);
      const queryEquipo = `UPDATE equipos SET ${campos.join(', ')} WHERE id = ?`;
      await connection.execute<ResultSetHeader>(queryEquipo, valores);
    }

    // Actualizar o crear detalle si se proporciona
    if (datos.detalle !== undefined) {
      // Verificar si existe detalle
      const [detalleExistente] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM detalles_equipos WHERE equipo_id = ?',
        [id]
      );

      if (detalleExistente.length > 0) {
        // Actualizar detalle existente
        await connection.execute(
          'UPDATE detalles_equipos SET detalle = ? WHERE equipo_id = ?',
          [JSON.stringify(datos.detalle), id]
        );
      } else {
        // Crear nuevo detalle
        await connection.execute(
          'INSERT INTO detalles_equipos (equipo_id, detalle) VALUES (?, ?)',
          [id, JSON.stringify(datos.detalle)]
        );
      }
    }

    await connection.commit();
    return true;

  } catch (error: any) {
    await connection.rollback();
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.message.includes('categoria_id')) {
        throw new Error('La categoría especificada no existe');
      }
      if (error.message.includes('orden_compra_id')) {
        throw new Error('La orden de compra especificada no existe');
      }
    }
    
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Soft delete de Equipo
 */
export const eliminarEquipo = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE equipos SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};