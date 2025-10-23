import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { ExcelGeneratorService } from '../services/excelGenerator.service';
import { GuiaRequestDTO, TiendaData, SKUData } from '../types/guias.types';

export class GuiasController {
  /**
   * Genera archivo Excel de guía de remisión
   * POST /api/guias/generar-excel
   */
  static async generarExcel(req: Request, res: Response): Promise<void> {
    try {
      const data: GuiaRequestDTO = req.body;

      // 1. Consultar datos de la tienda
      const tienda = await GuiasController.obtenerTienda(data.tienda_id);
      if (!tienda) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada',
        });
        return;
      }

      // 2. Consultar SKUs
      const skuIds = data.detalle.map((d) => d.sku_id);
      const skus = await GuiasController.obtenerSKUs(skuIds);

      if (skus.length !== skuIds.length) {
        res.status(404).json({
          success: false,
          message: 'Algunos SKUs no fueron encontrados',
        });
        return;
      }

      // 3. Generar Excel
      const buffer = await ExcelGeneratorService.generarExcel(
        data,
        tienda,
        skus
      );

      // 4. Generar nombre del archivo
      const tipo = data.tipo.toUpperCase();
      const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
      
      // Sanitizar nombre de tienda (quitar caracteres especiales y espacios)
      const nombreTiendaSanitizado = tienda.nombre_tienda
        .replace(/[^a-zA-Z0-9\s]/g, '') // Quitar caracteres especiales
        .replace(/\s+/g, '_')            // Reemplazar espacios por guiones bajos
        .toUpperCase();
      
      const filename = `GRE_${tipo}_${nombreTiendaSanitizado}_${fecha}_${data.nro_orden}.xlsx`;

      // 5. Enviar archivo
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      res.send(buffer);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar archivo Excel',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene datos completos de una tienda
   */
  private static async obtenerTienda(
    tiendaId: number
  ): Promise<TiendaData | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          t.id,
          t.pdv,
          t.nombre_tienda,
          t.socio_id,
          s.ruc as socio_ruc,
          s.razon_social as socio_razon_social,
          t.direccion,
          t.ubigeo,
          t.activo
        FROM tienda t
        INNER JOIN socio s ON t.socio_id = s.id
        WHERE t.id = ? AND t.activo = 1`,
        [tiendaId]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        pdv: row.pdv,
        nombre_tienda: row.nombre_tienda,
        socio_id: row.socio_id,
        socio_ruc: row.socio_ruc,
        socio_razon_social: row.socio_razon_social,
        direccion: row.direccion,
        ubigeo: row.ubigeo,
        activo: row.activo === 1,
      };
    } catch (error) {
      console.error('Error al obtener tienda:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos de múltiples SKUs
   */
  private static async obtenerSKUs(skuIds: number[]): Promise<SKUData[]> {
    try {
      if (skuIds.length === 0) {
        return [];
      }

      const placeholders = skuIds.map(() => '?').join(',');
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          id,
          codigo_sku,
          descripcion_sku,
          activo
        FROM skus
        WHERE id IN (${placeholders}) AND activo = 1`,
        skuIds
      );

      return rows.map((row) => ({
        id: row.id,
        codigo_sku: row.codigo_sku,
        descripcion_sku: row.descripcion_sku,
        activo: row.activo === 1,
      }));
    } catch (error) {
      console.error('Error al obtener SKUs:', error);
      throw error;
    }
  }

  /**
   * Obtiene lista de tiendas activas para el dropdown
   * GET /api/guias/tiendas
   */
  static async obtenerTiendasActivas(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          t.id,
          t.pdv,
          t.nombre_tienda,
          t.direccion,
          t.ubigeo,
          s.razon_social as socio_razon_social
        FROM tienda t
        INNER JOIN socio s ON t.socio_id = s.id
        WHERE t.activo = 1
        ORDER BY t.pdv ASC`
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener tiendas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tiendas',
      });
    }
  }

  /**
   * Obtiene lista de SKUs activos para el dropdown
   * GET /api/guias/skus
   */
  static async obtenerSKUsActivos(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          id,
          codigo_sku,
          descripcion_sku
        FROM skus
        WHERE activo = 1
        ORDER BY descripcion_sku ASC`
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error('Error al obtener SKUs:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener SKUs',
      });
    }
  }
}