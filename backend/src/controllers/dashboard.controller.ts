import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import {
  DashboardStats,
  SkusPorMes,
  TiendasPorSocio,
  OrdenesPorMes,
  UltimoSKU,
  UltimaTienda,
  UltimaOrden,
  InventoryMetrics,
  CoverageMetrics,
  GrowthRate,
  ModelosPorMes,
  TopCategoria,
  DistribucionEquipo,
  TopMarca,
  MatrizCobertura,
  UltimoModelo,
  AlertasIndicadores,
  UltimoSKUEnhanced,
  UltimaOrdenEnhanced,
  FiltrosDashboard,
} from '../types/dashboard.types';

export class DashboardController {
  // =============================================
  // MÉTODOS EXISTENTES (ACTUALIZADOS CON TYPES)
  // =============================================

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

      const stats: DashboardStats = {
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
      };

      res.json({
        success: true,
        data: stats,
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
      const periodo = Number(req.query.periodo) || 6;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
          DATE_FORMAT(fecha_creacion, '%b %Y') as mes_nombre,
          COUNT(*) as cantidad
        FROM skus
        WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY mes, mes_nombre
        ORDER BY mes ASC`,
        [periodo]
      );

      const data: SkusPorMes = rows.map((row) => ({
        mes: row.mes,
        mes_nombre: row.mes_nombre,
        cantidad: row.cantidad,
      }));

      res.json({
        success: true,
        data,
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

      const data: TiendasPorSocio[] = rows.map((row) => ({
        socio: row.socio,
        cantidad: row.cantidad,
      }));

      res.json({
        success: true,
        data,
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
      const periodo = Number(req.query.periodo) || 6;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          DATE_FORMAT(fecha_ingreso, '%Y-%m') as mes,
          DATE_FORMAT(fecha_ingreso, '%b %Y') as mes_nombre,
          COUNT(*) as cantidad
        FROM ordenes_compra
        WHERE fecha_ingreso >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY mes, mes_nombre
        ORDER BY mes ASC`,
        [periodo]
      );

      const data: OrdenesPorMes = rows.map((row) => ({
        mes: row.mes,
        mes_nombre: row.mes_nombre,
        cantidad: row.cantidad,
      }));

      res.json({
        success: true,
        data,
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

      const data: UltimoSKU[] = rows.map((row) => ({
        codigo_sku: row.codigo_sku,
        descripcion_sku: row.descripcion_sku,
        activo: row.activo,
        fecha_creacion: row.fecha_creacion,
      }));

      res.json({
        success: true,
        data,
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

      const data: UltimaTienda[] = rows.map((row) => ({
        pdv: row.pdv,
        nombre_tienda: row.nombre_tienda,
        socio: row.socio,
        activo: row.activo,
        fecha_creacion: row.fecha_creacion,
      }));

      res.json({
        success: true,
        data,
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

      const data: UltimaOrden[] = rows.map((row) => ({
        numero_orden: row.numero_orden,
        detalle: row.detalle,
        fecha_ingreso: row.fecha_ingreso,
        activo: row.activo,
        fecha_creacion: row.fecha_creacion,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener últimas órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener últimas órdenes',
      });
    }
  }

  // =============================================
  // MÉTODOS NUEVOS CON TYPES
  // =============================================

  /**
   * Obtener métricas de inventario (modelos, marcas, promedios)
   * GET /api/dashboard/metricas-inventario
   */
  static async getInventoryMetrics(req: Request, res: Response): Promise<void> {
    try {
      const [
        [modelosResult],
        [marcasResult],
        [subcategoriasResult],
        [promedioModelosResult],
        [promedioTiendasResult],
      ] = await Promise.all([
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM modelos'
        ),
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM marcas'
        ),
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total, SUM(activo = 1) as activos FROM subcategorias'
        ),
        pool.query<RowDataPacket[]>(
          `SELECT 
            ROUND(COUNT(m.id) / COUNT(DISTINCT ma.id), 2) as promedio
          FROM marcas ma
          LEFT JOIN modelos m ON ma.id = m.marca_id AND m.activo = 1
          WHERE ma.activo = 1`
        ),
        pool.query<RowDataPacket[]>(
          `SELECT 
            ROUND(COUNT(t.id) / COUNT(DISTINCT s.id), 2) as promedio
          FROM socio s
          LEFT JOIN tienda t ON s.id = t.socio_id AND t.activo = 1
          WHERE s.activo = 1`
        ),
      ]);

      const metrics: InventoryMetrics = {
        modelos: {
          total: modelosResult[0].total,
          activos: modelosResult[0].activos,
        },
        marcas: {
          total: marcasResult[0].total,
          activos: marcasResult[0].activos,
        },
        subcategorias: {
          total: subcategoriasResult[0].total,
          activos: subcategoriasResult[0].activos,
        },
        promedioModelosPorMarca: promedioModelosResult[0].promedio || 0,
        promedioTiendasPorSocio: promedioTiendasResult[0].promedio || 0,
      };

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error('Error al obtener métricas de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de inventario',
      });
    }
  }

  /**
   * Obtener métricas de cobertura del catálogo
   * GET /api/dashboard/metricas-cobertura
   */
  static async getCoverageMetrics(req: Request, res: Response): Promise<void> {
    try {
      const [
        [sociosConTiendasResult],
        [sociosSinTiendasResult],
        [categoriasConModelosResult],
        [categoriasSinModelosResult],
      ] = await Promise.all([
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(DISTINCT s.id) as total
          FROM socio s
          INNER JOIN tienda t ON s.id = t.socio_id AND t.activo = 1
          WHERE s.activo = 1`
        ),
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total
          FROM socio s
          WHERE s.activo = 1
          AND NOT EXISTS (
            SELECT 1 FROM tienda t 
            WHERE t.socio_id = s.id AND t.activo = 1
          )`
        ),
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(DISTINCT c.id) as total
          FROM categorias c
          INNER JOIN subcategorias sc ON c.id = sc.categoria_id AND sc.activo = 1
          INNER JOIN modelos m ON sc.id = m.subcategoria_id AND m.activo = 1
          WHERE c.activo = 1`
        ),
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total
          FROM categorias c
          WHERE c.activo = 1
          AND NOT EXISTS (
            SELECT 1 FROM subcategorias sc
            INNER JOIN modelos m ON sc.id = m.subcategoria_id AND m.activo = 1
            WHERE sc.categoria_id = c.id AND sc.activo = 1
          )`
        ),
      ]);

      const sociosConTiendas = sociosConTiendasResult[0].total;
      const sociosSinTiendas = sociosSinTiendasResult[0].total;
      const categoriasConModelos = categoriasConModelosResult[0].total;
      const categoriasSinModelos = categoriasSinModelosResult[0].total;

      const totalCategorias = categoriasConModelos + categoriasSinModelos;
      const porcentajeCobertura = totalCategorias > 0 
        ? Math.round((categoriasConModelos / totalCategorias) * 100) 
        : 0;

      const metrics: CoverageMetrics = {
        sociosConTiendas,
        sociosSinTiendas,
        categoriasConModelos,
        categoriasSinModelos,
        porcentajeCoberturaCatalogo: porcentajeCobertura,
      };

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error('Error al obtener métricas de cobertura:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de cobertura',
      });
    }
  }

  /**
   * Obtener tasa de crecimiento mensual (SKUs, Órdenes, Modelos)
   * GET /api/dashboard/tasa-crecimiento
   */
  static async getGrowthRate(req: Request, res: Response): Promise<void> {
    try {
      const [
        [skusMesActual],
        [skusMesAnterior],
        [ordenesMesActual],
        [ordenesMesAnterior],
        [modelosMesActual],
        [modelosMesAnterior],
      ] = await Promise.all([
        // SKUs mes actual
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total FROM skus 
          WHERE YEAR(fecha_creacion) = YEAR(CURDATE()) 
          AND MONTH(fecha_creacion) = MONTH(CURDATE())`
        ),
        // SKUs mes anterior
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total FROM skus 
          WHERE YEAR(fecha_creacion) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
          AND MONTH(fecha_creacion) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`
        ),
        // Órdenes mes actual
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total FROM ordenes_compra 
          WHERE YEAR(fecha_ingreso) = YEAR(CURDATE()) 
          AND MONTH(fecha_ingreso) = MONTH(CURDATE())`
        ),
        // Órdenes mes anterior
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total FROM ordenes_compra 
          WHERE YEAR(fecha_ingreso) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
          AND MONTH(fecha_ingreso) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`
        ),
        // Modelos mes actual
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total FROM modelos 
          WHERE YEAR(fecha_creacion) = YEAR(CURDATE()) 
          AND MONTH(fecha_creacion) = MONTH(CURDATE())`
        ),
        // Modelos mes anterior
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total FROM modelos 
          WHERE YEAR(fecha_creacion) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
          AND MONTH(fecha_creacion) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`
        ),
      ]);

      // Calcular porcentajes de crecimiento
      const calcularCrecimiento = (actual: number, anterior: number): number => {
        if (anterior === 0) return actual > 0 ? 100 : 0;
        return Math.round(((actual - anterior) / anterior) * 100);
      };

      const growthRate: GrowthRate = {
        skus: {
          mesActual: skusMesActual[0].total,
          mesAnterior: skusMesAnterior[0].total,
          porcentajeCrecimiento: calcularCrecimiento(
            skusMesActual[0].total,
            skusMesAnterior[0].total
          ),
        },
        ordenes: {
          mesActual: ordenesMesActual[0].total,
          mesAnterior: ordenesMesAnterior[0].total,
          porcentajeCrecimiento: calcularCrecimiento(
            ordenesMesActual[0].total,
            ordenesMesAnterior[0].total
          ),
        },
        modelos: {
          mesActual: modelosMesActual[0].total,
          mesAnterior: modelosMesAnterior[0].total,
          porcentajeCrecimiento: calcularCrecimiento(
            modelosMesActual[0].total,
            modelosMesAnterior[0].total
          ),
        },
      };

      res.json({
        success: true,
        data: growthRate,
      });
    } catch (error) {
      console.error('Error al obtener tasa de crecimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tasa de crecimiento',
      });
    }
  }

/**
   * Obtener modelos registrados por mes (últimos 6 meses)
   * GET /api/dashboard/modelos-por-mes
   */
  static async getModelosPorMes(req: Request, res: Response): Promise<void> {
    try {
      const periodo = Number(req.query.periodo) || 6;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
          DATE_FORMAT(fecha_creacion, '%b %Y') as mes_nombre,
          COUNT(*) as cantidad
        FROM modelos
        WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY mes, mes_nombre
        ORDER BY mes ASC`,
        [periodo]
      );

      const data: ModelosPorMes = rows.map((row) => ({
        mes: row.mes,
        mes_nombre: row.mes_nombre,
        cantidad: row.cantidad,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener modelos por mes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener modelos por mes',
      });
    }
  }

  /**
   * Obtener top categorías por cantidad de modelos
   * GET /api/dashboard/top-categorias
   */
  static async getTopCategorias(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          c.nombre as categoria,
          COUNT(m.id) as cantidad_modelos
        FROM categorias c
        INNER JOIN subcategorias sc ON c.id = sc.categoria_id AND sc.activo = 1
        INNER JOIN modelos m ON sc.id = m.subcategoria_id AND m.activo = 1
        WHERE c.activo = 1
        GROUP BY c.id, c.nombre
        ORDER BY cantidad_modelos DESC
        LIMIT ?`,
        [limit]
      );

      // Calcular total para porcentajes
      const total = rows.reduce((sum, row) => sum + row.cantidad_modelos, 0);

      const data: TopCategoria[] = rows.map((row) => ({
        categoria: row.categoria,
        cantidad_modelos: row.cantidad_modelos,
        porcentaje: total > 0 ? Math.round((row.cantidad_modelos / total) * 100) : 0,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener top categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener top categorías',
      });
    }
  }

  /**
   * Obtener distribución de equipos por categoría (para pie chart)
   * GET /api/dashboard/distribucion-equipos
   */
  static async getDistribucionEquipos(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          c.nombre as categoria,
          COUNT(m.id) as cantidad
        FROM categorias c
        LEFT JOIN subcategorias sc ON c.id = sc.categoria_id AND sc.activo = 1
        LEFT JOIN modelos m ON sc.id = m.subcategoria_id AND m.activo = 1
        WHERE c.activo = 1
        GROUP BY c.id, c.nombre
        HAVING cantidad > 0
        ORDER BY cantidad DESC`
      );

      // Calcular total para porcentajes
      const total = rows.reduce((sum, row) => sum + row.cantidad, 0);

      const data: DistribucionEquipo[] = rows.map((row) => ({
        categoria: row.categoria,
        cantidad: row.cantidad,
        porcentaje: total > 0 ? Math.round((row.cantidad / total) * 100) : 0,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener distribución de equipos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener distribución de equipos',
      });
    }
  }

  /**
   * Obtener top marcas por cantidad de modelos
   * GET /api/dashboard/top-marcas
   */
  static async getTopMarcas(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const categoriaId = req.query.categoria_id ? Number(req.query.categoria_id) : null;

      let query = `
        SELECT 
          ma.nombre as marca,
          COUNT(DISTINCT m.id) as cantidad_modelos,
          COUNT(DISTINCT c.id) as categorias_cubiertas
        FROM marcas ma
        INNER JOIN modelos m ON ma.id = m.marca_id AND m.activo = 1
        INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id AND sc.activo = 1
        INNER JOIN categorias c ON sc.categoria_id = c.id AND c.activo = 1
        WHERE ma.activo = 1
      `;

      const valores: any[] = [];

      if (categoriaId) {
        query += ' AND c.id = ?';
        valores.push(categoriaId);
      }

      query += `
        GROUP BY ma.id, ma.nombre
        ORDER BY cantidad_modelos DESC
        LIMIT ?
      `;
      valores.push(limit);

      const [rows] = await pool.query<RowDataPacket[]>(query, valores);

      const data: TopMarca[] = rows.map((row) => ({
        marca: row.marca,
        cantidad_modelos: row.cantidad_modelos,
        categorias_cubiertas: row.categorias_cubiertas,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener top marcas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener top marcas',
      });
    }
  }

  /**
   * Obtener matriz de cobertura marca-categoría
   * GET /api/dashboard/matriz-cobertura
   */
  static async getMatrizCobertura(req: Request, res: Response): Promise<void> {
    try {
      // Obtener todas las categorías activas
      const [categorias] = await pool.query<RowDataPacket[]>(
        'SELECT id, nombre FROM categorias WHERE activo = 1 ORDER BY nombre'
      );

      // Obtener datos de cobertura
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          ma.nombre as marca,
          c.nombre as categoria,
          COUNT(m.id) as cantidad
        FROM marcas ma
        INNER JOIN modelos m ON ma.id = m.marca_id AND m.activo = 1
        INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id AND sc.activo = 1
        INNER JOIN categorias c ON sc.categoria_id = c.id AND c.activo = 1
        WHERE ma.activo = 1
        GROUP BY ma.nombre, c.nombre
        ORDER BY ma.nombre, c.nombre`
      );

      // Construir matriz
      const matrizMap = new Map<string, MatrizCobertura>();

      rows.forEach((row) => {
        if (!matrizMap.has(row.marca)) {
          matrizMap.set(row.marca, { marca: row.marca });
        }
        const marcaData = matrizMap.get(row.marca)!;
        marcaData[row.categoria] = row.cantidad;
      });

      // Asegurar que todas las categorías existan en cada marca (con 0 si no hay datos)
      matrizMap.forEach((marcaData) => {
        categorias.forEach((cat: any) => {
          if (!(cat.nombre in marcaData)) {
            marcaData[cat.nombre] = 0;
          }
        });
      });

      const data: MatrizCobertura[] = Array.from(matrizMap.values());

      res.json({
        success: true,
        data: {
          matriz: data,
          categorias: categorias.map((c: any) => c.nombre),
        },
      });
    } catch (error) {
      console.error('Error al obtener matriz de cobertura:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener matriz de cobertura',
      });
    }
  }

  /**
   * Obtener últimos modelos registrados
   * GET /api/dashboard/ultimos-modelos
   */
  static async getUltimosModelos(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 5;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          m.nombre,
          ma.nombre as marca,
          c.nombre as categoria,
          sc.nombre as subcategoria,
          m.fecha_creacion,
          m.activo,
          DATEDIFF(NOW(), m.fecha_creacion) as dias_desde_creacion
        FROM modelos m
        INNER JOIN marcas ma ON m.marca_id = ma.id
        INNER JOIN subcategorias sc ON m.subcategoria_id = sc.id
        INNER JOIN categorias c ON sc.categoria_id = c.id
        ORDER BY m.fecha_creacion DESC
        LIMIT ?`,
        [limit]
      );

      const data: UltimoModelo[] = rows.map((row) => ({
        nombre: row.nombre,
        marca: row.marca,
        categoria: row.categoria,
        subcategoria: row.subcategoria,
        fecha_creacion: row.fecha_creacion,
        activo: row.activo,
        es_nuevo: row.dias_desde_creacion <= 7,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error al obtener últimos modelos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener últimos modelos',
      });
    }
  }

  /**
   * Obtener alertas e indicadores del dashboard
   * GET /api/dashboard/alertas-indicadores
   */
  static async getAlertasIndicadores(req: Request, res: Response): Promise<void> {
    try {
      const [
        [categoriasVaciasResult],
        [sociosSinTiendasResult],
        [marcasSinModelosResult],
        [totalCategoriasResult],
        [categoriasConModelosResult],
        [totalModelosResult],
        [topMarcasResult],
        [totalMarcasResult],
      ] = await Promise.all([
        // Categorías sin modelos
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total
          FROM categorias c
          WHERE c.activo = 1
          AND NOT EXISTS (
            SELECT 1 FROM subcategorias sc
            INNER JOIN modelos m ON sc.id = m.subcategoria_id AND m.activo = 1
            WHERE sc.categoria_id = c.id AND sc.activo = 1
          )`
        ),
        // Socios sin tiendas
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total
          FROM socio s
          WHERE s.activo = 1
          AND NOT EXISTS (
            SELECT 1 FROM tienda t 
            WHERE t.socio_id = s.id AND t.activo = 1
          )`
        ),
        // Marcas sin modelos
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) as total
          FROM marcas ma
          WHERE ma.activo = 1
          AND NOT EXISTS (
            SELECT 1 FROM modelos m 
            WHERE m.marca_id = ma.id AND m.activo = 1
          )`
        ),
        // Total categorías activas
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM categorias WHERE activo = 1'
        ),
        // Categorías con modelos
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(DISTINCT c.id) as total
          FROM categorias c
          INNER JOIN subcategorias sc ON c.id = sc.categoria_id AND sc.activo = 1
          INNER JOIN modelos m ON sc.id = m.subcategoria_id AND m.activo = 1
          WHERE c.activo = 1`
        ),
        // Total modelos activos
        pool.query<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM modelos WHERE activo = 1'
        ),
        // Top 3 marcas
        pool.query<RowDataPacket[]>(
  `SELECT COUNT(DISTINCT m.id) as total
  FROM modelos m
  INNER JOIN (
    SELECT marca_id
    FROM modelos
    WHERE activo = 1
    GROUP BY marca_id
    ORDER BY COUNT(*) DESC
    LIMIT 3
  ) top_marcas ON m.marca_id = top_marcas.marca_id
  WHERE m.activo = 1`
),
        // Total marcas con modelos activos
        pool.query<RowDataPacket[]>(
          `SELECT COUNT(DISTINCT marca_id) as total
          FROM modelos
          WHERE activo = 1`
        ),
      ]);

      const totalCategorias = totalCategoriasResult[0].total;
      const categoriasConModelos = categoriasConModelosResult[0].total;
      const totalModelos = totalModelosResult[0].total;
      const modelosTopMarcas = topMarcasResult[0].total;

      const alertasIndicadores: AlertasIndicadores = {
        alertas: {
          categoriasVacias: categoriasVaciasResult[0].total,
          sociosSinTiendas: sociosSinTiendasResult[0].total,
          marcasSinModelos: marcasSinModelosResult[0].total,
        },
        indicadores: {
          tasaCompletitudCatalogo:
            totalCategorias > 0
              ? Math.round((categoriasConModelos / totalCategorias) * 100)
              : 0,
          concentracionTopMarcas:
            totalModelos > 0
              ? Math.round((modelosTopMarcas / totalModelos) * 100)
              : 0,
          diversidadCatalogo: totalMarcasResult[0].total,
        },
      };

      res.json({
        success: true,
        data: alertasIndicadores,
      });
    } catch (error) {
      console.error('Error al obtener alertas e indicadores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener alertas e indicadores',
      });
    }
  }
}
