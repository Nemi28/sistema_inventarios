/**
 * Funciones de exportación para Equipos
 * Agregar al archivo equipos.model.ts existente
 */

import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface FiltrosExportarEquipos {
  ubicacion?: 'ALMACEN' | 'TIENDA' | 'PERSONA' | 'EN_TRANSITO';
  estado?: 'OPERATIVO' | 'POR_VALIDAR' | 'EN_GARANTIA' | 'INOPERATIVO' | 'BAJA';
  categoria_id?: number;
  subcategoria_id?: number;
  marca_id?: number;
  modelo_id?: number;
  tienda_id?: number;
  busqueda?: string;
}

/**
 * Obtener equipos para exportar a Excel
 * Sin paginación, máximo 5000 registros
 */
export async function obtenerEquiposParaExportar(filtros: FiltrosExportarEquipos): Promise<RowDataPacket[]> {
  let query = `
    SELECT 
      e.id,
      e.numero_serie,
      e.inv_entel,
      c.nombre AS categoria,
      sc.nombre AS subcategoria,
      ma.nombre AS marca,
      m.nombre AS modelo,
      e.tipo_propiedad,
      e.estado_actual,
      e.ubicacion_actual,
      t.pdv AS tienda_pdv,
      t.tipo_local,
      t.perfil_local,
      t.nombre_tienda,
      s.razon_social AS socio,
      e.hostname,
      e.posicion_tienda,
      e.area_tienda,
      e.responsable_socio,
      e.responsable_entel,
      e.sistema_operativo,
      e.garantia,
      e.fecha_compra,
      oc.numero_orden AS orden_compra,
      e.observaciones,
      e.fecha_creacion,
      e.fecha_actualizacion,
      -- Procedencia: última ubicación de donde vino el equipo
      (
        SELECT 
          CASE 
            WHEN em.ubicacion_origen = 'TIENDA' THEN COALESCE(t_origen.nombre_tienda, 'Tienda')
            WHEN em.ubicacion_origen = 'PERSONA' THEN COALESCE(em.persona_origen, 'Persona')
            WHEN em.ubicacion_origen = 'ALMACEN' THEN 'Almacén'
            ELSE em.ubicacion_origen
          END
        FROM equipos_movimientos em
        LEFT JOIN tienda t_origen ON em.tienda_origen_id = t_origen.id
        WHERE em.equipo_id = e.id 
          AND em.activo = true
          AND em.estado_movimiento = 'COMPLETADO'
        ORDER BY em.fecha_creacion DESC
        LIMIT 1
      ) AS procedencia,
      -- Datos de persona asignada (último movimiento a persona)
      (
        SELECT em.persona_destino
        FROM equipos_movimientos em
        WHERE em.equipo_id = e.id 
          AND em.activo = true
          AND em.ubicacion_destino = 'PERSONA'
          AND em.estado_movimiento = 'COMPLETADO'
        ORDER BY em.fecha_creacion DESC
        LIMIT 1
      ) AS persona_asignada,
      (
        SELECT em.codigo_acta
        FROM equipos_movimientos em
        WHERE em.equipo_id = e.id 
          AND em.activo = true
          AND em.ubicacion_destino = 'PERSONA'
          AND em.estado_movimiento = 'COMPLETADO'
        ORDER BY em.fecha_creacion DESC
        LIMIT 1
      ) AS codigo_acta,
      (
        SELECT em.fecha_salida
        FROM equipos_movimientos em
        WHERE em.equipo_id = e.id 
          AND em.activo = true
          AND em.ubicacion_destino = 'PERSONA'
          AND em.estado_movimiento = 'COMPLETADO'
        ORDER BY em.fecha_creacion DESC
        LIMIT 1
      ) AS fecha_asignacion,
      (
        SELECT em.tipo_movimiento
        FROM equipos_movimientos em
        WHERE em.equipo_id = e.id 
          AND em.activo = true
          AND em.ubicacion_destino = 'PERSONA'
          AND em.estado_movimiento = 'COMPLETADO'
        ORDER BY em.fecha_creacion DESC
        LIMIT 1
      ) AS tipo_movimiento_persona
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    LEFT JOIN tienda t ON e.tienda_id = t.id
    LEFT JOIN socio s ON t.socio_id = s.id
    LEFT JOIN ordenes_compra oc ON e.orden_compra_id = oc.id
    WHERE e.activo = true
  `;

  const params: any[] = [];

  // Filtro por ubicación
  if (filtros.ubicacion) {
    query += ` AND e.ubicacion_actual = ?`;
    params.push(filtros.ubicacion);
  }

  // Filtro por estado
  if (filtros.estado) {
    query += ` AND e.estado_actual = ?`;
    params.push(filtros.estado);
  }

  // Filtro por categoría
  if (filtros.categoria_id) {
    query += ` AND c.id = ?`;
    params.push(filtros.categoria_id);
  }

  // Filtro por subcategoría
  if (filtros.subcategoria_id) {
    query += ` AND sc.id = ?`;
    params.push(filtros.subcategoria_id);
  }

  // Filtro por marca
  if (filtros.marca_id) {
    query += ` AND ma.id = ?`;
    params.push(filtros.marca_id);
  }

  // Filtro por modelo
  if (filtros.modelo_id) {
    query += ` AND m.id = ?`;
    params.push(filtros.modelo_id);
  }

  // Filtro por tienda
  if (filtros.tienda_id) {
    query += ` AND e.tienda_id = ?`;
    params.push(filtros.tienda_id);
  }

  // Búsqueda general
  if (filtros.busqueda) {
    query += ` AND (
      e.numero_serie LIKE ? OR
      e.inv_entel LIKE ? OR
      m.nombre LIKE ? OR
      ma.nombre LIKE ? OR
      t.nombre_tienda LIKE ?
    )`;
    const busqueda = `%${filtros.busqueda}%`;
    params.push(busqueda, busqueda, busqueda, busqueda, busqueda);
  }

  query += ` ORDER BY c.nombre, e.fecha_creacion DESC LIMIT 5000`;

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}