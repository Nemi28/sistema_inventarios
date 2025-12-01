/**
 * Controlador Dashboard v2
 * Sistema de Gestión de Inventarios
 * Enfocado en métricas operativas de equipos y movimientos
 */

import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class DashboardController {
  // =============================================
  // KPIS DE EQUIPOS
  // =============================================

  /**
   * Obtener KPIs de equipos por ubicación
   * GET /api/dashboard/equipos-ubicacion
   */
  static async getEquiposPorUbicacion(req: Request, res: Response): Promise<void> {
    try {
      const [result] = await pool.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ubicacion_actual = 'ALMACEN' THEN 1 ELSE 0 END) as en_almacen,
          SUM(CASE WHEN ubicacion_actual = 'TIENDA' THEN 1 ELSE 0 END) as en_tiendas,
          SUM(CASE WHEN ubicacion_actual = 'PERSONA' THEN 1 ELSE 0 END) as en_personas,
          SUM(CASE WHEN ubicacion_actual = 'EN_TRANSITO' THEN 1 ELSE 0 END) as en_transito
        FROM equipos
        WHERE activo = true
      `);

      // Contar movimientos en tránsito (estado EN_TRANSITO en movimientos)
      const [movEnTransito] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(DISTINCT equipo_id) as cantidad
        FROM equipos_movimientos
        WHERE estado_movimiento = 'EN_TRANSITO' AND activo = true
      `);

      res.json({
        success: true,
        data: {
          total: result[0].total || 0,
          en_almacen: result[0].en_almacen || 0,
          en_tiendas: result[0].en_tiendas || 0,
          en_personas: result[0].en_personas || 0,
          en_transito: movEnTransito[0].cantidad || 0,
        },
      });
    } catch (error) {
      console.error('Error al obtener equipos por ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener equipos por ubicación',
      });
    }
  }

  /**
   * Obtener KPIs de equipos por estado
   * GET /api/dashboard/equipos-estado
   */
  static async getEquiposPorEstado(req: Request, res: Response): Promise<void> {
    try {
      const [result] = await pool.query<RowDataPacket[]>(`
        SELECT 
          SUM(CASE WHEN estado_actual = 'OPERATIVO' THEN 1 ELSE 0 END) as operativo,
          SUM(CASE WHEN estado_actual = 'POR_VALIDAR' THEN 1 ELSE 0 END) as por_validar,
          SUM(CASE WHEN estado_actual = 'EN_GARANTIA' THEN 1 ELSE 0 END) as en_garantia,
          SUM(CASE WHEN estado_actual = 'INOPERATIVO' THEN 1 ELSE 0 END) as inoperativo,
          SUM(CASE WHEN estado_actual = 'BAJA' THEN 1 ELSE 0 END) as baja
        FROM equipos
        WHERE activo = true
      `);

      res.json({
        success: true,
        data: {
          operativo: result[0].operativo || 0,
          por_validar: result[0].por_validar || 0,
          en_garantia: result[0].en_garantia || 0,
          inoperativo: result[0].inoperativo || 0,
          baja: result[0].baja || 0,
        },
      });
    } catch (error) {
      console.error('Error al obtener equipos por estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener equipos por estado',
      });
    }
  }

  // =============================================
  // ACTIVIDAD DE MOVIMIENTOS
  // =============================================

  /**
   * Obtener actividad de movimientos (hoy, mes actual, mes anterior)
   * GET /api/dashboard/actividad-movimientos
   */
  static async getActividadMovimientos(req: Request, res: Response): Promise<void> {
    try {
      const [result] = await pool.query<RowDataPacket[]>(`
        SELECT 
          SUM(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN 1 ELSE 0 END) as hoy,
          SUM(CASE WHEN YEAR(fecha_creacion) = YEAR(CURDATE()) 
                   AND MONTH(fecha_creacion) = MONTH(CURDATE()) THEN 1 ELSE 0 END) as mes_actual,
          SUM(CASE WHEN YEAR(fecha_creacion) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                   AND MONTH(fecha_creacion) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN 1 ELSE 0 END) as mes_anterior
        FROM equipos_movimientos
        WHERE activo = true
      `);

      const mesActual = result[0].mes_actual || 0;
      const mesAnterior = result[0].mes_anterior || 0;
      
      // Calcular porcentaje de crecimiento
      let porcentajeCrecimiento = 0;
      if (mesAnterior > 0) {
        porcentajeCrecimiento = Math.round(((mesActual - mesAnterior) / mesAnterior) * 100);
      } else if (mesActual > 0) {
        porcentajeCrecimiento = 100;
      }

      res.json({
        success: true,
        data: {
          hoy: result[0].hoy || 0,
          mes_actual: mesActual,
          mes_anterior: mesAnterior,
          porcentaje_crecimiento: porcentajeCrecimiento,
        },
      });
    } catch (error) {
      console.error('Error al obtener actividad de movimientos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener actividad de movimientos',
      });
    }
  }

  // =============================================
  // ALERTAS OPERATIVAS
  // =============================================

  /**
   * Obtener alertas operativas
   * GET /api/dashboard/alertas-operativas
   */
  static async getAlertasOperativas(req: Request, res: Response): Promise<void> {
    try {
      // Movimientos en tránsito por más de 7 días
      const [enTransitoLargo] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as cantidad
        FROM equipos_movimientos
        WHERE estado_movimiento = 'EN_TRANSITO'
          AND activo = true
          AND DATEDIFF(CURDATE(), fecha_salida) > 7
      `);

      // Movimientos pendientes
      const [pendientes] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as cantidad
        FROM equipos_movimientos
        WHERE estado_movimiento = 'PENDIENTE'
          AND activo = true
      `);

      // Equipos en almacén sin movimiento en más de 30 días
      const [sinMovimiento] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as cantidad
        FROM equipos e
        WHERE e.activo = true
          AND e.ubicacion_actual = 'ALMACEN'
          AND NOT EXISTS (
            SELECT 1 FROM equipos_movimientos em
            WHERE em.equipo_id = e.id
              AND em.activo = true
              AND em.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          )
      `);

      // Total de equipos en tránsito (cualquier tiempo)
      const [enTransitoTotal] = await pool.query<RowDataPacket[]>(`
        SELECT COUNT(*) as cantidad
        FROM equipos_movimientos
        WHERE estado_movimiento = 'EN_TRANSITO'
          AND activo = true
      `);

      res.json({
        success: true,
        data: {
          en_transito_largo: enTransitoLargo[0].cantidad || 0,
          pendientes: pendientes[0].cantidad || 0,
          sin_movimiento_30_dias: sinMovimiento[0].cantidad || 0,
          en_transito_total: enTransitoTotal[0].cantidad || 0,
        },
      });
    } catch (error) {
      console.error('Error al obtener alertas operativas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener alertas operativas',
      });
    }
  }

  // =============================================
  // GRÁFICOS
  // =============================================

  /**
   * Obtener movimientos por mes (últimos 6 meses)
   * GET /api/dashboard/movimientos-por-mes
   */
  static async getMovimientosPorMes(req: Request, res: Response): Promise<void> {
    try {
      const periodo = Number(req.query.periodo) || 6;

      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
          DATE_FORMAT(fecha_creacion, '%b %Y') as mes_nombre,
          COUNT(*) as cantidad
        FROM equipos_movimientos
        WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? MONTH)
          AND activo = true
        GROUP BY mes, mes_nombre
        ORDER BY mes ASC
      `, [periodo]);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener movimientos por mes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener movimientos por mes',
      });
    }
  }

  /**
   * Obtener distribución de equipos por ubicación (para donut chart)
   * GET /api/dashboard/distribucion-ubicacion
   */
  static async getDistribucionUbicacion(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          ubicacion_actual as ubicacion,
          COUNT(*) as cantidad
        FROM equipos
        WHERE activo = true
        GROUP BY ubicacion_actual
        ORDER BY cantidad DESC
      `);

      const total = rows.reduce((sum, row) => sum + row.cantidad, 0);

      const data = rows.map((row) => ({
        ubicacion: row.ubicacion,
        cantidad: row.cantidad,
        porcentaje: total > 0 ? Math.round((row.cantidad / total) * 100) : 0,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener distribución por ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener distribución por ubicación',
      });
    }
  }

  /**
   * Obtener movimientos por tipo
   * GET /api/dashboard/movimientos-por-tipo
   */
  static async getMovimientosPorTipo(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          tipo_movimiento,
          COUNT(*) as cantidad
        FROM equipos_movimientos
        WHERE activo = true
          AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY tipo_movimiento
        ORDER BY cantidad DESC
      `);

      const tiposLabels: Record<string, string> = {
        INGRESO_ALMACEN: 'Ingreso Almacén',
        SALIDA_ASIGNACION: 'Asignación',
        SALIDA_REEMPLAZO: 'Reemplazo',
        SALIDA_PRESTAMO: 'Préstamo',
        RETORNO_TIENDA: 'Retorno Tienda',
        RETORNO_PERSONA: 'Retorno Persona',
        TRANSFERENCIA_TIENDAS: 'Transferencia',
        CAMBIO_ESTADO: 'Cambio Estado',
      };

      const data = rows.map((row) => ({
        tipo: row.tipo_movimiento,
        tipo_label: tiposLabels[row.tipo_movimiento] || row.tipo_movimiento,
        cantidad: row.cantidad,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener movimientos por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener movimientos por tipo',
      });
    }
  }

  /**
   * Obtener equipos por categoría
   * GET /api/dashboard/equipos-por-categoria
   */
  static async getEquiposPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          c.nombre as categoria,
          COUNT(e.id) as cantidad
        FROM equipos e
        INNER JOIN modelos m ON e.modelo_id = m.id
        INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
        INNER JOIN categorias c ON sc.categoria_id = c.id
        WHERE e.activo = true
        GROUP BY c.id, c.nombre
        ORDER BY cantidad DESC
      `);

      const total = rows.reduce((sum, row) => sum + row.cantidad, 0);

      const data = rows.map((row) => ({
        categoria: row.categoria,
        cantidad: row.cantidad,
        porcentaje: total > 0 ? Math.round((row.cantidad / total) * 100) : 0,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener equipos por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener equipos por categoría',
      });
    }
  }

  /**
   * Obtener top tiendas por cantidad de equipos
   * GET /api/dashboard/top-tiendas-equipos
   */
  static async getTopTiendasEquipos(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;

      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          t.nombre_tienda as tienda,
          t.pdv,
          s.razon_social as socio,
          COUNT(e.id) as cantidad_equipos
        FROM tienda t
        INNER JOIN socio s ON t.socio_id = s.id
        LEFT JOIN equipos e ON e.tienda_id = t.id AND e.activo = true AND e.ubicacion_actual = 'TIENDA'
        WHERE t.activo = true
        GROUP BY t.id, t.nombre_tienda, t.pdv, s.razon_social
        HAVING cantidad_equipos > 0
        ORDER BY cantidad_equipos DESC
        LIMIT ?
      `, [limit]);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener top tiendas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener top tiendas',
      });
    }
  }

  // =============================================
  // TABLAS RECIENTES
  // =============================================

  /**
   * Obtener últimos movimientos
   * GET /api/dashboard/ultimos-movimientos
   */
  static async getUltimosMovimientos(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 5;

      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          em.id,
          em.tipo_movimiento,
          em.estado_movimiento,
          em.ubicacion_origen,
          em.ubicacion_destino,
          em.persona_destino,
          em.fecha_salida,
          em.codigo_acta,
          e.numero_serie,
          e.inv_entel,
          m.nombre as modelo,
          ma.nombre as marca,
          to_.nombre_tienda as tienda_origen,
          td.nombre_tienda as tienda_destino,
          u.nombre as usuario
        FROM equipos_movimientos em
        INNER JOIN equipos e ON em.equipo_id = e.id
        INNER JOIN modelos m ON e.modelo_id = m.id
        INNER JOIN marcas ma ON m.marca_id = ma.id
        LEFT JOIN tienda to_ ON em.tienda_origen_id = to_.id
        LEFT JOIN tienda td ON em.tienda_destino_id = td.id
        INNER JOIN usuarios u ON em.usuario_id = u.id
        WHERE em.activo = true
        ORDER BY em.fecha_creacion DESC
        LIMIT ?
      `, [limit]);

      const tiposLabels: Record<string, string> = {
        INGRESO_ALMACEN: 'Ingreso',
        SALIDA_ASIGNACION: 'Asignación',
        SALIDA_REEMPLAZO: 'Reemplazo',
        SALIDA_PRESTAMO: 'Préstamo',
        RETORNO_TIENDA: 'Retorno Tienda',
        RETORNO_PERSONA: 'Retorno Persona',
        TRANSFERENCIA_TIENDAS: 'Transferencia',
        CAMBIO_ESTADO: 'Cambio Estado',
      };

      const data = rows.map((row) => ({
        ...row,
        tipo_label: tiposLabels[row.tipo_movimiento] || row.tipo_movimiento,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener últimos movimientos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener últimos movimientos',
      });
    }
  }

  /**
   * Obtener equipos en tránsito
   * GET /api/dashboard/equipos-en-transito
   */
  static async getEquiposEnTransito(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          em.id as movimiento_id,
          em.tipo_movimiento,
          em.ubicacion_origen,
          em.ubicacion_destino,
          em.persona_destino,
          em.fecha_salida,
          em.codigo_acta,
          DATEDIFF(CURDATE(), em.fecha_salida) as dias_en_transito,
          e.id as equipo_id,
          e.numero_serie,
          e.inv_entel,
          m.nombre as modelo,
          ma.nombre as marca,
          to_.nombre_tienda as tienda_origen,
          td.nombre_tienda as tienda_destino
        FROM equipos_movimientos em
        INNER JOIN equipos e ON em.equipo_id = e.id
        INNER JOIN modelos m ON e.modelo_id = m.id
        INNER JOIN marcas ma ON m.marca_id = ma.id
        LEFT JOIN tienda to_ ON em.tienda_origen_id = to_.id
        LEFT JOIN tienda td ON em.tienda_destino_id = td.id
        WHERE em.estado_movimiento = 'EN_TRANSITO'
          AND em.activo = true
        ORDER BY em.fecha_salida ASC
      `);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener equipos en tránsito:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener equipos en tránsito',
      });
    }
  }

  // =============================================
  // RESUMEN DE CATÁLOGO (mantener los existentes)
  // =============================================

  /**
   * Obtener resumen de catálogo (totales)
   * GET /api/dashboard/resumen-catalogo
   */
  static async getResumenCatalogo(req: Request, res: Response): Promise<void> {
    try {
      const [
        [skusResult],
        [tiendasResult],
        [sociosResult],
        [categoriasResult],
        [marcasResult],
        [modelosResult],
        [ordenesResult],
      ] = await Promise.all([
        pool.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM skus'),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM tienda'),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM socio'),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM categorias'),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM marcas'),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM modelos'),
        pool.query<RowDataPacket[]>('SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM ordenes_compra'),
      ]);

      res.json({
        success: true,
        data: {
          skus: { total: skusResult[0].total, activos: skusResult[0].activos },
          tiendas: { total: tiendasResult[0].total, activos: tiendasResult[0].activos },
          socios: { total: sociosResult[0].total, activos: sociosResult[0].activos },
          categorias: { total: categoriasResult[0].total, activos: categoriasResult[0].activos },
          marcas: { total: marcasResult[0].total, activos: marcasResult[0].activos },
          modelos: { total: modelosResult[0].total, activos: modelosResult[0].activos },
          ordenes: { total: ordenesResult[0].total, activos: ordenesResult[0].activos },
        },
      });
    } catch (error) {
      console.error('Error al obtener resumen de catálogo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen de catálogo',
      });
    }
  }

  /**
   * Obtener tiendas por socio (mantener existente)
   * GET /api/dashboard/tiendas-por-socio
   */
  static async getTiendasPorSocio(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          s.razon_social as socio,
          COUNT(t.id) as cantidad
        FROM socio s
        LEFT JOIN tienda t ON s.id = t.socio_id AND t.activo = 1
        WHERE s.activo = 1
        GROUP BY s.id, s.razon_social
        ORDER BY cantidad DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener tiendas por socio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tiendas por socio',
      });
    }
  }

  
}
