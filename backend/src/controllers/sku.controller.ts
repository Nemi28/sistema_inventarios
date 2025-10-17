/**
 * Controlador SKUs
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as SkuModel from '../models/sku.model';

/**
 * Crear nuevo SKU
 * POST /api/skus
 * Roles: gestor, administrador
 */
export const crear = async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const { codigo_sku, descripcion_sku, activo } = req.body;

    // Verificar si el código ya existe
    const skuExistente = await SkuModel.obtenerSKUPorCodigo(codigo_sku);
    if (skuExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'El código SKU ya existe',
      });
    }

    // Crear SKU
    const nuevoId = await SkuModel.crearSKU({
      codigo_sku,
      descripcion_sku,
      activo: activo ?? true,
    });

    // Obtener el SKU creado
    const skuCreado = await SkuModel.obtenerSKUPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'SKU creado exitosamente',
      data: skuCreado,
    });
  } catch (error: any) {
    console.error('Error al crear SKU:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear SKU',
      error: error.message,
    });
  }
};

/**
 * Listar SKUs con paginación y filtros
 * GET /api/skus
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { page, limit, activo, codigo_sku, ordenar_por, orden } = req.query;

    const filtros: SkuModel.FiltrosSKU = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      codigo_sku: codigo_sku as string,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await SkuModel.listarSKUs(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar SKUs:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar SKUs',
      error: error.message,
    });
  }
};

/**
 * Buscar SKUs por término
 * GET /api/skus/buscar?q=termino
 * Roles: todos
 */
export const buscar = async (req: Request, res: Response) => {
  try {
    const { q, page, limit } = req.query;

    if (!q || (q as string).trim() === '') {
      return res.status(400).json({
        success: false,
        mensaje: 'El parámetro de búsqueda "q" es requerido',
      });
    }

    const filtros = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    };

    const resultado = await SkuModel.buscarSKUs(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar SKUs:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar SKUs',
      error: error.message,
    });
  }
};

/**
 * Obtener SKU por ID
 * GET /api/skus/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sku = await SkuModel.obtenerSKUPorId(parseInt(id));

    if (!sku) {
      return res.status(404).json({
        success: false,
        mensaje: 'SKU no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: sku,
    });
  } catch (error: any) {
    console.error('Error al obtener SKU:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener SKU',
      error: error.message,
    });
  }
};

/**
 * Actualizar SKU
 * PUT /api/skus/:id
 * Roles: gestor, administrador
 */
export const actualizar = async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const { id } = req.params;
    const { codigo_sku, descripcion_sku, activo } = req.body;

    // Verificar si el SKU existe
    const skuExistente = await SkuModel.obtenerSKUPorId(parseInt(id));
    if (!skuExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'SKU no encontrado',
      });
    }

    // Si se cambia el código, verificar que no exista otro con ese código
    if (codigo_sku && codigo_sku !== skuExistente.codigo_sku) {
      const skuConMismoCodigo = await SkuModel.obtenerSKUPorCodigo(codigo_sku);
      if (skuConMismoCodigo) {
        return res.status(400).json({
          success: false,
          mensaje: 'El código SKU ya existe',
        });
      }
    }

    // Actualizar
    const actualizado = await SkuModel.actualizarSKU(parseInt(id), {
      codigo_sku,
      descripcion_sku,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar el SKU',
      });
    }

    // Obtener SKU actualizado
    const skuActualizado = await SkuModel.obtenerSKUPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'SKU actualizado exitosamente',
      data: skuActualizado,
    });
  } catch (error: any) {
    console.error('Error al actualizar SKU:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar SKU',
      error: error.message,
    });
  }
};

/**
 * Eliminar SKU (soft delete)
 * DELETE /api/skus/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si el SKU existe
    const skuExistente = await SkuModel.obtenerSKUPorId(parseInt(id));
    if (!skuExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'SKU no encontrado',
      });
    }

    // Soft delete
    const eliminado = await SkuModel.eliminarSKU(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar el SKU',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'SKU eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar SKU:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar SKU',
      error: error.message,
    });
  }
};