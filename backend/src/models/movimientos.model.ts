/**
 * Modelo Movimientos
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

export interface Movimiento {
  id?: number;
  equipo_id: number;
  tipo_movimiento:
    | 'INGRESO_ALMACEN'
    | 'SALIDA_ASIGNACION'
    | 'SALIDA_REEMPLAZO'
    | 'SALIDA_PRESTAMO'
    | 'RETORNO_TIENDA'
    | 'RETORNO_PERSONA'
    | 'TRANSFERENCIA_TIENDAS'
    | 'CAMBIO_ESTADO';
  ubicacion_origen: 'ALMACEN' | 'TIENDA' | 'PERSONA';
  tienda_origen_id?: number;
  persona_origen?: string;
  ubicacion_destino: 'ALMACEN' | 'TIENDA' | 'PERSONA';
  tienda_destino_id?: number;
  persona_destino?: string;
  estado_movimiento: 'PENDIENTE' | 'EN_TRANSITO' | 'COMPLETADO' | 'CANCELADO';
  codigo_acta?: string;
  fecha_salida: Date | string;
  fecha_llegada?: Date | string;
  ticket_helix?: string;
  usuario_id: number;
  motivo?: string;
  observaciones?: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface MovimientoCompleto extends Movimiento {
  equipo_serie?: string;
  equipo_inv_entel?: string;
  equipo_modelo?: string;
  tienda_origen_nombre?: string;
  tienda_destino_nombre?: string;
  usuario_nombre?: string;
}

export interface FiltrosMovimiento extends PaginacionParams {
  equipo_id?: number;
  tipo_movimiento?: string;
  estado_movimiento?: string;
  ubicacion_origen?: string;
  ubicacion_destino?: string;
  tienda_origen_id?: number;
  tienda_destino_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  codigo_acta?: string;
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear movimientos (uno o varios equipos con transacción atómica)
 */
export const crearMovimientos = async (
  equipos_ids: number[],
  datosMovimiento: Omit<Movimiento, 'equipo_id' | 'id'>
): Promise<{ movimientos_ids: number[]; cantidad: number }> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const movimientosIds: number[] = [];

    for (const equipo_id of equipos_ids) {
      // 1. Insertar movimiento
      const queryMovimiento = `
        INSERT INTO equipos_movimientos (
          equipo_id, tipo_movimiento, ubicacion_origen, tienda_origen_id, persona_origen,
          ubicacion_destino, tienda_destino_id, persona_destino, estado_movimiento,
          codigo_acta, fecha_salida, fecha_llegada, ticket_helix, usuario_id,
          motivo, observaciones, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [resultMovimiento] = await connection.execute<ResultSetHeader>(queryMovimiento, [
        equipo_id,
        datosMovimiento.tipo_movimiento,
        datosMovimiento.ubicacion_origen,
        datosMovimiento.tienda_origen_id || null,
        datosMovimiento.persona_origen || null,
        datosMovimiento.ubicacion_destino,
        datosMovimiento.tienda_destino_id || null,
        datosMovimiento.persona_destino || null,
        datosMovimiento.estado_movimiento,
        datosMovimiento.codigo_acta || null,
        datosMovimiento.fecha_salida,
        datosMovimiento.fecha_llegada || null,
        datosMovimiento.ticket_helix || null,
        datosMovimiento.usuario_id,
        datosMovimiento.motivo || null,
        datosMovimiento.observaciones || null,
        datosMovimiento.activo ?? true,
      ]);

      movimientosIds.push(resultMovimiento.insertId);

      // 2. Actualizar ubicación del equipo
      const queryActualizarEquipo = `
        UPDATE equipos 
        SET 
          ubicacion_actual = ?,
          tienda_id = ?
        WHERE id = ?
      `;

      await connection.execute(queryActualizarEquipo, [
        datosMovimiento.ubicacion_destino,
        datosMovimiento.tienda_destino_id || null,
        equipo_id,
      ]);
    }

    await connection.commit();
    
    return {
      movimientos_ids: movimientosIds,
      cantidad: equipos_ids.length,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Listar movimientos con filtros y paginación
 */
export const listarMovimientos = async (filtros: FiltrosMovimiento = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['em.fecha_salida', 'em.fecha_creacion', 'em.tipo_movimiento']
  );

  const condiciones: string[] = ['em.activo = true'];
  const valores: any[] = [];

  if (filtros.equipo_id) {
    condiciones.push('em.equipo_id = ?');
    valores.push(filtros.equipo_id);
  }

  if (filtros.tipo_movimiento) {
    condiciones.push('em.tipo_movimiento = ?');
    valores.push(filtros.tipo_movimiento);
  }

  if (filtros.estado_movimiento) {
    condiciones.push('em.estado_movimiento = ?');
    valores.push(filtros.estado_movimiento);
  }

  if (filtros.ubicacion_origen) {
    condiciones.push('em.ubicacion_origen = ?');
    valores.push(filtros.ubicacion_origen);
  }

  if (filtros.ubicacion_destino) {
    condiciones.push('em.ubicacion_destino = ?');
    valores.push(filtros.ubicacion_destino);
  }

  if (filtros.tienda_origen_id) {
    condiciones.push('em.tienda_origen_id = ?');
    valores.push(filtros.tienda_origen_id);
  }

  if (filtros.tienda_destino_id) {
    condiciones.push('em.tienda_destino_id = ?');
    valores.push(filtros.tienda_destino_id);
  }

  if (filtros.codigo_acta) {
    condiciones.push('em.codigo_acta = ?');
    valores.push(filtros.codigo_acta);
  }

  if (filtros.fecha_desde) {
    condiciones.push('em.fecha_salida >= ?');
    valores.push(filtros.fecha_desde);
  }

  if (filtros.fecha_hasta) {
    condiciones.push('em.fecha_salida <= ?');
    valores.push(filtros.fecha_hasta);
  }

  const whereClause = condiciones.join(' AND ');

  // Query para contar
  const queryCount = `
    SELECT COUNT(*) as total
    FROM equipos_movimientos em
    WHERE ${whereClause}
  `;

  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Query principal
  const query = `
    SELECT 
      em.*,
      e.numero_serie as equipo_serie,
      e.inv_entel as equipo_inv_entel,
      m.nombre as equipo_modelo,
      ma.nombre as equipo_marca,
      to_.nombre_tienda as tienda_origen_nombre,
      td.nombre_tienda as tienda_destino_nombre,
      u.nombre as usuario_nombre
    FROM equipos_movimientos em
    INNER JOIN equipos e ON em.equipo_id = e.id
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN marcas ma ON m.marca_id = ma.id 
    LEFT JOIN tienda to_ ON em.tienda_origen_id = to_.id
    LEFT JOIN tienda td ON em.tienda_destino_id = td.id
    INNER JOIN usuarios u ON em.usuario_id = u.id
    WHERE ${whereClause}
    ORDER BY ${campo} ${direccion}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [movimientos] = await pool.execute<RowDataPacket[]>(query, valores);

  return {
    data: movimientos,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Obtener historial de movimientos de un equipo
 */
export const obtenerHistorialEquipo = async (equipoId: number) => {
  const query = `
    SELECT 
      em.*,
      to_.nombre_tienda as tienda_origen_nombre,
      td.nombre_tienda as tienda_destino_nombre,
      u.nombre as usuario_nombre
    FROM equipos_movimientos em
    LEFT JOIN tienda to_ ON em.tienda_origen_id = to_.id
    LEFT JOIN tienda td ON em.tienda_destino_id = td.id
    INNER JOIN usuarios u ON em.usuario_id = u.id
    WHERE em.equipo_id = ? AND em.activo = true
    ORDER BY em.fecha_salida DESC, em.fecha_creacion DESC
  `;

  const [movimientos] = await pool.execute<RowDataPacket[]>(query, [equipoId]);
  return movimientos as MovimientoCompleto[];
};

/**
 * Obtener movimiento por ID
 */
export const obtenerMovimientoPorId = async (id: number): Promise<MovimientoCompleto | null> => {
  const query = `
    SELECT 
      em.*,
      e.numero_serie as equipo_serie,
      e.inv_entel as equipo_inv_entel,
      m.nombre as equipo_modelo,
      to_.nombre_tienda as tienda_origen_nombre,
      td.nombre_tienda as tienda_destino_nombre,
      u.nombre as usuario_nombre
    FROM equipos_movimientos em
    INNER JOIN equipos e ON em.equipo_id = e.id
    INNER JOIN modelos m ON e.modelo_id = m.id
    LEFT JOIN tienda to_ ON em.tienda_origen_id = to_.id
    LEFT JOIN tienda td ON em.tienda_destino_id = td.id
    INNER JOIN usuarios u ON em.usuario_id = u.id
    WHERE em.id = ?
  `;

  const [movimientos] = await pool.execute<RowDataPacket[]>(query, [id]);
  return movimientos.length > 0 ? (movimientos[0] as MovimientoCompleto) : null;
};

/**
 * Actualizar estado y código de acta de movimiento
 */
export const actualizarEstadoMovimiento = async (
  id: number,
  estado: 'PENDIENTE' | 'EN_TRANSITO' | 'COMPLETADO' | 'CANCELADO',
  fecha_llegada?: Date | string,
  codigo_acta?: string  // ← NUEVO PARÁMETRO
): Promise<boolean> => {
  const campos: string[] = ['estado_movimiento = ?'];
  const valores: any[] = [estado];

  if (fecha_llegada) {
    campos.push('fecha_llegada = ?');
    valores.push(fecha_llegada);
  }

  // ✅ AGREGAR: Actualizar código de acta
  if (codigo_acta) {
    campos.push('codigo_acta = ?');
    valores.push(codigo_acta);
  }

  valores.push(id);

  const query = `UPDATE equipos_movimientos SET ${campos.join(', ')} WHERE id = ?`;
  const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

  return resultado.affectedRows > 0;
};