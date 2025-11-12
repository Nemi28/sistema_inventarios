import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class DashboardController {
  /**
   * Obtener estadísticas generales del dashboard
   * GET /api/dashboard/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Consultas en paralelo para mejor rendimiento
      const [
        [skusResult],
        [tiendasResult],
        [sociosResult],
        [ordenesResult],
        [categoriasResult],
      ] = await Promise.all([
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM skus'
        ),
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM tienda'
        ),
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM socio'
        ),
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM ordenes_compra'
        ),
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM categorias'
        ),
      ]);

      res.json({
        success: true,
        data: {
          skus: {
            total: skusResult[0].total,
            activos: skusResult[0].activos,
          },
          tiendas: {
            total: tiendasResult[0].total,
            activos: tiendasResult[0].activos,
          },
          socios: {
            total: sociosResult[0].total,
            activos: sociosResult[0].activos,
          },
          ordenes: {
            total: ordenesResult[0].total,
            activos: ordenesResult[0].activos,
          },
          categorias: {
            total: categoriasResult[0].total,
            activos: categoriasResult[0].activos,
          },
        },
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del dashboard',
      });
    }
  }

/**
 * Obtener SKUs creados por mes (últimos 6 meses)
 * GET /api/dashboard/skus-por-mes
 */
static async getSkusPorMes(req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
        DATE_FORMAT(fecha_creacion, '%b %Y') as mes_nombre,
        COUNT(*) as cantidad
      FROM skus
      WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY mes, mes_nombre
      ORDER BY mes ASC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error al obtener SKUs por mes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de SKUs por mes',
    });
  }
}

  /**
   * Obtener tiendas por socio
   * GET /api/dashboard/tiendas-por-socio
   */
  static async getTiendasPorSocio(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          s.razon_social as socio,
          COUNT(t.id) as cantidad
        FROM socio s
        LEFT JOIN tienda t ON s.id = t.socio_id AND t.activo = 1
        WHERE s.activo = 1
        GROUP BY s.id, s.razon_social
        ORDER BY cantidad DESC
        LIMIT 10`
      );

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

/**
 * Obtener órdenes de compra por mes (últimos 6 meses)
 * GET /api/dashboard/ordenes-por-mes
 */
static async getOrdenesPorMes(req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_ingreso, '%Y-%m') as mes,
        DATE_FORMAT(fecha_ingreso, '%b %Y') as mes_nombre,
        COUNT(*) as cantidad
      FROM ordenes_compra
      WHERE fecha_ingreso >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY mes, mes_nombre
      ORDER BY mes ASC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error al obtener órdenes por mes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes por mes',
    });
  }
}

  /**
   * Obtener últimos SKUs creados
   * GET /api/dashboard/ultimos-skus
   */
  static async getUltimosSKUs(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          codigo_sku,
          descripcion_sku,
          activo,
          fecha_creacion
        FROM skus
        ORDER BY fecha_creacion DESC
        LIMIT 5`
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener últimos SKUs:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener últimos SKUs',
      });
    }
  }

  /**
   * Obtener últimas tiendas registradas
   * GET /api/dashboard/ultimas-tiendas
   */
  static async getUltimasTiendas(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          t.pdv,
          t.nombre_tienda,
          s.razon_social as socio,
          t.activo,
          t.fecha_creacion
        FROM tienda t
        INNER JOIN socio s ON t.socio_id = s.id
        ORDER BY t.fecha_creacion DESC
        LIMIT 5`
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener últimas tiendas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener últimas tiendas',
      });
    }
  }

  /**
   * Obtener últimas órdenes de compra
   * GET /api/dashboard/ultimas-ordenes
   */
  static async getUltimasOrdenes(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          numero_orden,
          detalle,
          fecha_ingreso,
          activo,
          fecha_creacion
        FROM ordenes_compra
        ORDER BY fecha_creacion DESC
        LIMIT 5`
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener últimas órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener últimas órdenes',
      });
    }
  }
}