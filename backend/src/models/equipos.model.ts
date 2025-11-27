/**
 * Modelo Equipos
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

export interface Equipo {
  id?: number;
  numero_serie?: string;
  inv_entel?: string;
  modelo_id: number;
  orden_compra_id?: number;
  tipo_propiedad: 'PROPIO' | 'ALQUILADO';
  fecha_compra?: Date | string | null;
  garantia?: boolean;
  sistema_operativo?: string;
  estado_actual: 'OPERATIVO' | 'POR_VALIDAR' | 'EN_GARANTIA' | 'BAJA' | 'INOPERATIVO';
  ubicacion_actual: 'ALMACEN' | 'TIENDA' | 'PERSONA' | 'EN_TRANSITO';
  tienda_id?: number;
  hostname?: string;
  posicion_tienda?: string;
  area_tienda?: string;
  responsable_socio?: string;
  responsable_entel?: string;
  es_accesorio?: boolean;
  equipo_principal_id?: number;
  observaciones?: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface EquipoCompleto extends Equipo {
  modelo_nombre?: string;
  marca_nombre?: string;
  categoria_nombre?: string;
  subcategoria_nombre?: string;
  tienda_nombre?: string;
  tienda_pdv?: string;
  orden_numero?: string;
  equipo_principal_serie?: string;
}

export interface FiltrosEquipo extends PaginacionParams {
  activo?: boolean;
  modelo_id?: number;
  categoria_id?: number;
  subcategoria_id?: number;
  marca_id?: number;
  estado_actual?: string;
  ubicacion_actual?: string;
  tienda_id?: number;
  tipo_propiedad?: string;
  garantia?: boolean;
  es_accesorio?: boolean;
  busqueda?: string; // ← NUEVO: Parámetro de búsqueda
  ordenar_por?: string;
  orden?: string;
}

/**
 * Crear nuevo Equipo
 */
export const crearEquipo = async (equipo: Equipo): Promise<number> => {
  try {
    const query = `
      INSERT INTO equipos (
        numero_serie, inv_entel, modelo_id, orden_compra_id,
        tipo_propiedad, fecha_compra, garantia, sistema_operativo,
        estado_actual, ubicacion_actual, tienda_id,
        hostname, posicion_tienda, area_tienda,
        responsable_socio, responsable_entel,
        es_accesorio, equipo_principal_id, observaciones, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [
      equipo.numero_serie || null,
      equipo.inv_entel || null,
      equipo.modelo_id,
      equipo.orden_compra_id || null,
      equipo.tipo_propiedad,
      equipo.fecha_compra || null,
      equipo.garantia ?? false,
      equipo.sistema_operativo || null,
      equipo.estado_actual,
      equipo.ubicacion_actual,
      equipo.tienda_id || null,
      equipo.hostname || null,
      equipo.posicion_tienda || null,
      equipo.area_tienda || null,
      equipo.responsable_socio || null,
      equipo.responsable_entel || null,
      equipo.es_accesorio ?? false,
      equipo.equipo_principal_id || null,
      equipo.observaciones || null,
      equipo.activo ?? true,
    ]);

    return resultado.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un equipo con ese código de inventario');
    }
    throw error;
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
    ['e.numero_serie', 'e.inv_entel', 'e.estado_actual', 'e.ubicacion_actual', 'e.fecha_creacion', 'e.fecha_actualizacion']
  );

  // Construir WHERE dinámico
  const condiciones: string[] = [];
  const valores: any[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push('e.activo = ?');
    valores.push(filtros.activo);
  }

  if (filtros.modelo_id) {
    condiciones.push('e.modelo_id = ?');
    valores.push(filtros.modelo_id);
  }

  if (filtros.estado_actual) {
    condiciones.push('e.estado_actual = ?');
    valores.push(filtros.estado_actual);
  }

  if (filtros.ubicacion_actual) {
    condiciones.push('e.ubicacion_actual = ?');
    valores.push(filtros.ubicacion_actual);
  }

  if (filtros.tienda_id) {
    condiciones.push('e.tienda_id = ?');
    valores.push(filtros.tienda_id);
  }

  if (filtros.tipo_propiedad) {
    condiciones.push('e.tipo_propiedad = ?');
    valores.push(filtros.tipo_propiedad);
  }

  if (filtros.garantia !== undefined) {
    condiciones.push('e.garantia = ?');
    valores.push(filtros.garantia);
  }

  if (filtros.es_accesorio !== undefined) {
    condiciones.push('e.es_accesorio = ?');
    valores.push(filtros.es_accesorio);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  // Contar total
  const queryCount = `
  SELECT COUNT(*) as total 
  FROM equipos e
  INNER JOIN modelos m ON e.modelo_id = m.id
  INNER JOIN marcas ma ON m.marca_id = ma.id
  INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
  INNER JOIN categorias c ON sc.categoria_id = c.id
  LEFT JOIN tienda t ON e.tienda_id = t.id
  LEFT JOIN ordenes_compra oc ON e.orden_compra_id = oc.id
  LEFT JOIN equipos ep ON e.equipo_principal_id = ep.id
  ${whereClause}
`;

  const [totalRows] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = totalRows[0].total;

  // Obtener registros con JOINs
  const querySelect = `
    SELECT 
      e.*,
      m.nombre as modelo_nombre,
      ma.nombre as marca_nombre,
      c.nombre as categoria_nombre,
      sc.nombre as subcategoria_nombre,
      t.nombre_tienda as tienda_nombre,
      t.pdv as tienda_pdv,
      oc.numero_orden as orden_numero,
      ep.numero_serie as equipo_principal_serie
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    LEFT JOIN tienda t ON e.tienda_id = t.id
    LEFT JOIN ordenes_compra oc ON e.orden_compra_id = oc.id
    LEFT JOIN equipos ep ON e.equipo_principal_id = ep.id
    ${whereClause} 
    ORDER BY ${campo} ${direccion} 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [equipos] = await pool.execute<RowDataPacket[]>(querySelect, valores);

  return {
    data: equipos,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Buscar Equipos por serial, inv_entel, modelo, marca, etc
 */
export const buscarEquipos = async (termino: string, filtros: PaginacionParams = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const terminoBusqueda = `%${termino}%`;

  // Contar total de resultados
  const queryCount = `
    SELECT COUNT(*) as total FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    LEFT JOIN tienda t ON e.tienda_id = t.id
    WHERE (
      e.numero_serie LIKE ? OR 
      e.inv_entel LIKE ? OR 
      m.nombre LIKE ? OR 
      ma.nombre LIKE ? OR
      t.nombre_tienda LIKE ?
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
      m.nombre as modelo_nombre,
      ma.nombre as marca_nombre,
      c.nombre as categoria_nombre,
      sc.nombre as subcategoria_nombre,
      t.nombre_tienda as tienda_nombre,
      t.pdv as tienda_pdv
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    LEFT JOIN tienda t ON e.tienda_id = t.id
    WHERE (
      e.numero_serie LIKE ? OR 
      e.inv_entel LIKE ? OR 
      m.nombre LIKE ? OR 
      ma.nombre LIKE ? OR
      t.nombre_tienda LIKE ?
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
export const obtenerEquipoPorId = async (id: number): Promise<EquipoCompleto | null> => {
  const query = `
    SELECT 
      e.*,
      m.nombre as modelo_nombre,
      ma.nombre as marca_nombre,
      c.nombre as categoria_nombre,
      sc.nombre as subcategoria_nombre,
      t.nombre_tienda as tienda_nombre,
      t.pdv as tienda_pdv,
      oc.numero_orden as orden_numero,
      ep.numero_serie as equipo_principal_serie
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    LEFT JOIN tienda t ON e.tienda_id = t.id
    LEFT JOIN ordenes_compra oc ON e.orden_compra_id = oc.id
    LEFT JOIN equipos ep ON e.equipo_principal_id = ep.id
    WHERE e.id = ?
  `;
  
  const [equipos] = await pool.execute<RowDataPacket[]>(query, [id]);

  return equipos.length > 0 ? (equipos[0] as EquipoCompleto) : null;
};

/**
 * Obtener Equipo por Serial
 */
export const obtenerEquipoPorSerial = async (serial: string): Promise<Equipo | null> => {
  const [equipos] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM equipos WHERE numero_serie = ?',
    [serial]
  );

  return equipos.length > 0 ? (equipos[0] as Equipo) : null;
};

/**
 * Obtener Equipo por Inventario Entel
 */
export const obtenerEquipoPorInvEntel = async (invEntel: string): Promise<Equipo | null> => {
  const [equipos] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM equipos WHERE inv_entel = ?',
    [invEntel]
  );

  return equipos.length > 0 ? (equipos[0] as Equipo) : null;
};

/**
 * Actualizar Equipo
 */
export const actualizarEquipo = async (id: number, datos: Partial<Equipo>): Promise<boolean> => {
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.numero_serie !== undefined) {
      campos.push('numero_serie = ?');
      valores.push(datos.numero_serie);
    }

    if (datos.inv_entel !== undefined) {
      campos.push('inv_entel = ?');
      valores.push(datos.inv_entel);
    }

    if (datos.modelo_id !== undefined) {
      campos.push('modelo_id = ?');
      valores.push(datos.modelo_id);
    }

    if (datos.orden_compra_id !== undefined) {
      campos.push('orden_compra_id = ?');
      valores.push(datos.orden_compra_id);
    }

    if (datos.tipo_propiedad !== undefined) {
      campos.push('tipo_propiedad = ?');
      valores.push(datos.tipo_propiedad);
    }

    if (datos.fecha_compra !== undefined) {
      campos.push('fecha_compra = ?');
      const fechaValue = datos.fecha_compra === null || datos.fecha_compra === '' 
      ? null 
       : datos.fecha_compra;
       valores.push(fechaValue);
      }

    if (datos.garantia !== undefined) {
      campos.push('garantia = ?');
      valores.push(datos.garantia);
    }

    if (datos.sistema_operativo !== undefined) {
      campos.push('sistema_operativo = ?');
      valores.push(datos.sistema_operativo);
    }

    if (datos.estado_actual !== undefined) {
      campos.push('estado_actual = ?');
      valores.push(datos.estado_actual);
    }

    if (datos.ubicacion_actual !== undefined) {
      campos.push('ubicacion_actual = ?');
      valores.push(datos.ubicacion_actual);
    }

    if (datos.tienda_id !== undefined) {
      campos.push('tienda_id = ?');
      valores.push(datos.tienda_id);
    }

    if (datos.hostname !== undefined) {
      campos.push('hostname = ?');
      valores.push(datos.hostname);
    }

    if (datos.posicion_tienda !== undefined) {
      campos.push('posicion_tienda = ?');
      valores.push(datos.posicion_tienda);
    }

    if (datos.area_tienda !== undefined) {
      campos.push('area_tienda = ?');
      valores.push(datos.area_tienda);
    }

    if (datos.responsable_socio !== undefined) {
      campos.push('responsable_socio = ?');
      valores.push(datos.responsable_socio);
    }

    if (datos.responsable_entel !== undefined) {
      campos.push('responsable_entel = ?');
      valores.push(datos.responsable_entel);
    }

    if (datos.es_accesorio !== undefined) {
      campos.push('es_accesorio = ?');
      valores.push(datos.es_accesorio);
    }

    if (datos.equipo_principal_id !== undefined) {
      campos.push('equipo_principal_id = ?');
      valores.push(datos.equipo_principal_id);
    }

    if (datos.observaciones !== undefined) {
      campos.push('observaciones = ?');
      valores.push(datos.observaciones);
    }

    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(id);

    const query = `UPDATE equipos SET ${campos.join(', ')} WHERE id = ?`;
    const [resultado] = await pool.execute<ResultSetHeader>(query, valores);

    return resultado.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un equipo con ese código de inventario');
    }
    throw error;
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

/**
 * Listar equipos en ALMACÉN con última ubicación y búsqueda
 */
export const listarEquiposAlmacen = async (filtros: FiltrosEquipo = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['e.numero_serie', 'e.inv_entel', 'e.estado_actual', 'e.fecha_creacion', 'm.nombre', 'ma.nombre']
  );

  const condiciones: string[] = ['e.ubicacion_actual = ?', 'e.activo = true'];
  const valores: any[] = ['ALMACEN'];

  // Búsqueda global
  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    const termino = `%${filtros.busqueda.trim()}%`;
    condiciones.push(`(
      e.numero_serie LIKE ? OR 
      e.inv_entel LIKE ? OR 
      m.nombre LIKE ? OR 
      ma.nombre LIKE ? OR
      c.nombre LIKE ? OR
      sc.nombre LIKE ? OR
      e.hostname LIKE ?
    )`);
    valores.push(termino, termino, termino, termino, termino, termino, termino);
  }

  // Filtros en cascada
  if (filtros.categoria_id) {
    condiciones.push('c.id = ?');
    valores.push(filtros.categoria_id);
  }

  if (filtros.subcategoria_id) {
    condiciones.push('sc.id = ?');
    valores.push(filtros.subcategoria_id);
  }

  if (filtros.marca_id) {
    condiciones.push('ma.id = ?');
    valores.push(filtros.marca_id);
  }

  if (filtros.modelo_id) {
    condiciones.push('e.modelo_id = ?');
    valores.push(filtros.modelo_id);
  }

  if (filtros.estado_actual) {
    condiciones.push('e.estado_actual = ?');
    valores.push(filtros.estado_actual);
  }

  const whereClause = condiciones.join(' AND ');

  // Query para contar total
  const queryCount = `
    SELECT COUNT(DISTINCT e.id) as total
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    WHERE ${whereClause}
  `;

  // Query principal con última ubicación
  const query = `
    SELECT 
      e.*,
      c.id as categoria_id,
      c.nombre as categoria_nombre,
      sc.id as subcategoria_id,
      sc.nombre as subcategoria_nombre,
      ma.id as marca_id,
      ma.nombre as marca_nombre,
      m.nombre as modelo_nombre,
      CASE 
        WHEN mov_anterior.ubicacion_origen = 'TIENDA' 
          THEN CONCAT('Tienda: ', t.nombre_tienda)
        WHEN mov_anterior.ubicacion_origen = 'PERSONA' 
          THEN CONCAT('Persona: ', mov_anterior.persona_origen)
        ELSE NULL
      END as ultima_ubicacion_origen
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    LEFT JOIN equipos_movimientos mov_anterior ON mov_anterior.equipo_id = e.id
      AND mov_anterior.id = (
        SELECT MAX(id) FROM equipos_movimientos 
        WHERE equipo_id = e.id 
        AND ubicacion_destino = 'ALMACEN'
      )
    LEFT JOIN tienda t ON mov_anterior.tienda_origen_id = t.id
    WHERE ${whereClause}
    ORDER BY ${campo} ${direccion}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [countResult] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = countResult[0].total;

  const [equipos] = await pool.execute<RowDataPacket[]>(query, valores);

  return {
    data: equipos,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Listar equipos en TIENDAS con datos de tienda y búsqueda
 */
export const listarEquiposTiendas = async (filtros: FiltrosEquipo = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['e.numero_serie', 'e.inv_entel', 't.nombre_tienda', 'e.fecha_creacion', 'm.nombre', 'ma.nombre']
  );

  const condiciones: string[] = ['e.ubicacion_actual = ?', 'e.activo = true'];
  const valores: any[] = ['TIENDA'];

  // Búsqueda global
  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    const termino = `%${filtros.busqueda.trim()}%`;
    condiciones.push(`(
      e.numero_serie LIKE ? OR 
      e.inv_entel LIKE ? OR 
      m.nombre LIKE ? OR 
      ma.nombre LIKE ? OR
      c.nombre LIKE ? OR
      sc.nombre LIKE ? OR
      t.nombre_tienda LIKE ? OR
      t.pdv LIKE ? OR
      e.hostname LIKE ? OR
      s.razon_social LIKE ?
    )`);
    valores.push(termino, termino, termino, termino, termino, termino, termino, termino, termino, termino);
  }

  // Filtros en cascada
  if (filtros.categoria_id) {
    condiciones.push('c.id = ?');
    valores.push(filtros.categoria_id);
  }

  if (filtros.subcategoria_id) {
    condiciones.push('sc.id = ?');
    valores.push(filtros.subcategoria_id);
  }

  if (filtros.marca_id) {
    condiciones.push('ma.id = ?');
    valores.push(filtros.marca_id);
  }

  if (filtros.modelo_id) {
    condiciones.push('e.modelo_id = ?');
    valores.push(filtros.modelo_id);
  }

  if (filtros.tienda_id) {
    condiciones.push('e.tienda_id = ?');
    valores.push(filtros.tienda_id);
  }

  if (filtros.estado_actual) {
    condiciones.push('e.estado_actual = ?');
    valores.push(filtros.estado_actual);
  }

  const whereClause = condiciones.join(' AND ');

  // Query para contar
  const queryCount = `
    SELECT COUNT(DISTINCT e.id) as total
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    LEFT JOIN tienda t ON e.tienda_id = t.id
    LEFT JOIN socio s ON t.socio_id = s.id
    WHERE ${whereClause}
  `;

  // Query principal
  const query = `
    SELECT 
      e.*,
      c.id as categoria_id,
      c.nombre as categoria_nombre,
      sc.id as subcategoria_id,
      sc.nombre as subcategoria_nombre,
      ma.id as marca_id,
      ma.nombre as marca_nombre,
      m.nombre as modelo_nombre,
      t.nombre_tienda,
      t.pdv,
      s.razon_social as socio_nombre
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    LEFT JOIN tienda t ON e.tienda_id = t.id
    LEFT JOIN socio s ON t.socio_id = s.id
    WHERE ${whereClause}
    ORDER BY ${campo} ${direccion}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [countResult] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = countResult[0].total;

  const [equipos] = await pool.execute<RowDataPacket[]>(query, valores);

  return {
    data: equipos,
    paginacion: generarPaginacion(total, page, limit),
  };
};

/**
 * Listar equipos asignados a PERSONAS con búsqueda
 */
export const listarEquiposPersonas = async (filtros: FiltrosEquipo = {}) => {
  const { page, limit, offset } = calcularPaginacion(filtros);
  const { campo, direccion } = validarOrdenamiento(
    filtros.ordenar_por,
    filtros.orden,
    ['e.numero_serie', 'e.inv_entel', 'mov_actual.fecha_salida', 'e.fecha_creacion', 'm.nombre', 'ma.nombre']
  );

  const condiciones: string[] = ['e.ubicacion_actual = ?', 'e.activo = true'];
  const valores: any[] = ['PERSONA'];

  // Búsqueda global - se aplicará después del JOIN con movimientos
  const busquedaTermino = filtros.busqueda && filtros.busqueda.trim() !== '' 
    ? `%${filtros.busqueda.trim()}%` 
    : null;

  // Filtros en cascada
  if (filtros.categoria_id) {
    condiciones.push('c.id = ?');
    valores.push(filtros.categoria_id);
  }

  if (filtros.subcategoria_id) {
    condiciones.push('sc.id = ?');
    valores.push(filtros.subcategoria_id);
  }

  if (filtros.marca_id) {
    condiciones.push('ma.id = ?');
    valores.push(filtros.marca_id);
  }

  if (filtros.modelo_id) {
    condiciones.push('e.modelo_id = ?');
    valores.push(filtros.modelo_id);
  }

  if (filtros.estado_actual) {
    condiciones.push('e.estado_actual = ?');
    valores.push(filtros.estado_actual);
  }

  // Agregar condición de búsqueda
  if (busquedaTermino) {
    condiciones.push(`(
      e.numero_serie LIKE ? OR 
      e.inv_entel LIKE ? OR 
      m.nombre LIKE ? OR 
      ma.nombre LIKE ? OR
      c.nombre LIKE ? OR
      sc.nombre LIKE ? OR
      mov_actual.persona_destino LIKE ? OR
      mov_actual.codigo_acta LIKE ?
    )`);
    valores.push(
      busquedaTermino, busquedaTermino, busquedaTermino, busquedaTermino,
      busquedaTermino, busquedaTermino, busquedaTermino, busquedaTermino
    );
  }

  const whereClause = condiciones.join(' AND ');

  // Query para contar
  const queryCount = `
    SELECT COUNT(DISTINCT e.id) as total
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    LEFT JOIN equipos_movimientos mov_actual 
      ON mov_actual.equipo_id = e.id 
      AND mov_actual.id = (
        SELECT MAX(id) FROM equipos_movimientos 
        WHERE equipo_id = e.id 
        AND ubicacion_destino = 'PERSONA'
      )
    WHERE ${whereClause}
  `;

  // Query principal con datos de persona y última ubicación
  const query = `
    SELECT 
      e.*,
      c.id as categoria_id,
      c.nombre as categoria_nombre,
      sc.id as subcategoria_id,
      sc.nombre as subcategoria_nombre,
      ma.id as marca_id,
      ma.nombre as marca_nombre,
      m.nombre as modelo_nombre,
      mov_actual.persona_destino as persona_asignada,
      mov_actual.fecha_salida as fecha_asignacion,
      mov_actual.codigo_acta,
      CASE 
        WHEN mov_anterior.ubicacion_origen = 'TIENDA' 
          THEN CONCAT('Tienda: ', t.nombre_tienda)
        WHEN mov_anterior.ubicacion_origen = 'PERSONA' 
          THEN CONCAT('Persona: ', mov_anterior.persona_origen)
        WHEN mov_anterior.ubicacion_origen = 'ALMACEN' 
          THEN 'Almacén'
        ELSE 'Almacén'
      END as ultima_ubicacion_origen
    FROM equipos e
    INNER JOIN modelos m ON e.modelo_id = m.id
    INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
    INNER JOIN categorias c ON sc.categoria_id = c.id
    INNER JOIN marcas ma ON m.marca_id = ma.id
    LEFT JOIN equipos_movimientos mov_actual 
      ON mov_actual.equipo_id = e.id 
      AND mov_actual.id = (
        SELECT MAX(id) FROM equipos_movimientos 
        WHERE equipo_id = e.id 
        AND ubicacion_destino = 'PERSONA'
      )
    LEFT JOIN equipos_movimientos mov_anterior
      ON mov_anterior.equipo_id = e.id
      AND mov_anterior.id = (
        SELECT MAX(id) FROM equipos_movimientos 
        WHERE equipo_id = e.id 
        AND id < mov_actual.id
      )
    LEFT JOIN tienda t ON mov_anterior.tienda_origen_id = t.id
    WHERE ${whereClause}
    ORDER BY ${campo} ${direccion}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [countResult] = await pool.execute<RowDataPacket[]>(queryCount, valores);
  const total = countResult[0].total;

  const [equipos] = await pool.execute<RowDataPacket[]>(query, valores);

  return {
    data: equipos,
    paginacion: generarPaginacion(total, page, limit),
  };
};