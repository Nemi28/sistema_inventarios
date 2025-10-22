/**
 * Modelo Tiendas
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

export interface Tienda {
  id?: number;
  pdv: string;
  tipo_local: string;
  perfil_local: string;
  nombre_tienda: string;
  socio_id: number;
  direccion: string;
  ubigeo: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface TiendaConSocio extends Tienda {
  socio_razon_social?: string;
  socio_ruc?: string;
}

export interface FiltrosTienda extends PaginacionParams {
  activo?: boolean;
  socio_id?: number;
  tipo_local?: string;
  perfil_local?: string;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nueva Tienda
 */
export const crearTienda = async (tienda: Tienda): Promise<number> => {
  try {
    const query = `
      INSERT INTO tienda (pdv, tipo_local, perfil_local, nombre_tienda, socio_id, direccion, ubigeo, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      tienda.pdv,
      tienda.tipo_local,
      tienda.perfil_local,
      tienda.nombre_tienda,
      tienda.socio_id,
      tienda.direccion,
      tienda.ubigeo,
      tienda.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('pdv')) {
        throw new Error('El PDV ya está registrado');
      }
      throw new Error('El nombre de tienda ya está registrado');
    }
    throw error;
  }
};

/**
 * Listar Tiendas con paginación y filtros
 */
export const listarTiendas = async (filtros: FiltrosTienda = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['pdv', 'nombre_tienda', 'tipo_local', 'perfil_local', 'fecha_creacion', 'fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('t.activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.socio_id) {
    condiciones.push('t.socio_id = ?');
    valores.push(filtros.socio_id);
  }

  if (filtros.tipo_local) {
    condiciones.push('t.tipo_local = ?');
    valores.push(filtros.tipo_local);
  }

  if (filtros.perfil_local) {
    condiciones.push('t.perfil_local = ?');
    valores.push(filtros.perfil_local);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `SELECT COUNT(*) as total FROM tienda t ${whereClause}`;
  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros con JOIN de socio
  const querySelect = `
    SELECT 
      t.*,
      s.razon_social as socio_razon_social,
      s.ruc as socio_ruc
    FROM tienda t
    INNER JOIN socio s ON t.socio_id = s.id
    ${whereClause} 
    ORDER BY t.${campo} ${direccion} 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [tiendas] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: tiendas,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Tiendas por PDV, nombre, dirección, ubigeo o razón social del socio
 */
export const buscarTiendas = async (termino: string, filtros: PaginacionParams = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);

  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM tienda t
    INNER JOIN socio s ON t.socio_id = s.id
    WHERE (
      t.pdv LIKE ? OR 
      t.nombre_tienda LIKE ? OR 
      t.direccion LIKE ? OR 
      t.ubigeo LIKE ? OR 
      s.razon_social LIKE ?
    ) AND t.activo = true
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
      t.*,
      s.razon_social as socio_razon_social,
      s.ruc as socio_ruc
    FROM tienda t
    INNER JOIN socio s ON t.socio_id = s.id
    WHERE (
      t.pdv LIKE ? OR 
      t.nombre_tienda LIKE ? OR 
      t.direccion LIKE ? OR 
      t.ubigeo LIKE ? OR 
      s.razon_social LIKE ?
    ) AND t.activo = true
    ORDER BY t.fecha_creacion DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [tiendas] = await pool.execute<RowDataPacket[]>(querySelect, [
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
    terminoBusqueda,
  ]);

  return {
    data: tiendas,
    paginacion: generarPaginacion(totalRows[0].total, page, limit),
  };
};

/**
 * Obtener Tienda por ID
 */
export const obtenerTiendaPorId = async (id: number): Promise<TiendaConSocio | null> => {
  const query = `
    SELECT 
      t.*,
      s.razon_social as socio_razon_social,
      s.ruc as socio_ruc
    FROM tienda t
    INNER JOIN socio s ON t.socio_id = s.id
    WHERE t.id = ?
  `;
  
  const [tiendas] = await pool.execute<RowDataPacket[]>(query, [id]);

  return tiendas.length > 0 ? (tiendas[0] as TiendaConSocio) : null;
};

/**
 * Obtener Tienda por PDV
 */
export const obtenerTiendaPorPDV = async (pdv: string): Promise<Tienda | null> => {
  const [tiendas] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM tienda WHERE pdv = ?',
    [pdv]
  );

  return tiendas.length > 0 ? (tiendas[0] as Tienda) : null;
};

/**
 * Obtener Tienda por nombre
 */
export const obtenerTiendaPorNombre = async (nombre: string): Promise<Tienda | null> => {
  const [tiendas] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM tienda WHERE nombre_tienda = ?',
    [nombre]
  );

  return tiendas.length > 0 ? (tiendas[0] as Tienda) : null;
};

/**
 * Verificar si existe un Socio por ID
 */
export const existeSocioPorId = async (socioId: number): Promise<boolean> => {
  const [socios] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM socio WHERE id = ?',
    [socioId]
  );

  return socios[0].count > 0;
};

/**
 * Actualizar Tienda
 */
export const actualizarTienda = async (id: number, datos: Partial<Tienda>): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.pdv !== undefined) {
      campos.push('pdv = ?');
      valores.push(datos.pdv);
    }

    if (datos.tipo_local !== undefined) {
      campos.push('tipo_local = ?');
      valores.push(datos.tipo_local);
    }

    if (datos.perfil_local !== undefined) {
      campos.push('perfil_local = ?');
      valores.push(datos.perfil_local);
    }

    if (datos.nombre_tienda !== undefined) {
      campos.push('nombre_tienda = ?');
      valores.push(datos.nombre_tienda);
    }

    if (datos.socio_id !== undefined) {
      campos.push('socio_id = ?');
      valores.push(datos.socio_id);
    }

    if (datos.direccion !== undefined) {
      campos.push('direccion = ?');
      valores.push(datos.direccion);
    }

    if (datos.ubigeo !== undefined) {
      campos.push('ubigeo = ?');
      valores.push(datos.ubigeo);
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(id);

    const query = `UPDATE tienda SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('pdv')) {
        throw new Error('El PDV ya está registrado');
      }
      throw new Error('El nombre de tienda ya está registrado');
    }
    throw error;
  }
};

/**
 * Soft delete de Tienda
 */
export const eliminarTienda = async (id: number): Promise<boolean> => {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE tienda SET activo = false WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};