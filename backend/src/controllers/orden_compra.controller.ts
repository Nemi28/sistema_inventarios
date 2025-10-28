/**
 * Controlador Órdenes de Compra
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as OrdenCompraModel from '../models/orden_compra.model';

/**
 * Crear nueva Orden de Compra
 * POST /api/ordenes-compra
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

    const { numero_orden, detalle, fecha_ingreso, activo } = req.body;

    // Verificar si el número de orden ya existe
    const ordenExistente = await OrdenCompraModel.obtenerOrdenCompraPorNumero(numero_orden);
    if (ordenExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'El número de orden ya existe',
      });
    }

    // Crear Orden de Compra
    const nuevoId = await OrdenCompraModel.crearOrdenCompra({
      numero_orden,
      detalle: detalle || null,
      fecha_ingreso,
      activo: activo ?? true,
    });

    // Obtener la orden creada
    const ordenCreada = await OrdenCompraModel.obtenerOrdenCompraPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Orden de Compra creada exitosamente',
      data: ordenCreada,
    });
  } catch (error: any) {
    console.error('Error al crear Orden de Compra:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear Orden de Compra',
      error: error.message,
    });
  }
};

/**
 * Listar Órdenes de Compra con paginación y filtros
 * GET /api/ordenes-compra
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { page, limit, activo, numero_orden, ordenar_por, orden } = req.query;

    const filtros: OrdenCompraModel.FiltrosOrdenCompra = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      numero_orden: numero_orden as string,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await OrdenCompraModel.listarOrdenesCompra(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar Órdenes de Compra:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar Órdenes de Compra',
      error: error.message,
    });
  }
};

/**
 * Buscar Órdenes de Compra por término
 * GET /api/ordenes-compra/buscar?q=termino
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

    const resultado = await OrdenCompraModel.buscarOrdenesCompra(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar Órdenes de Compra:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar Órdenes de Compra',
      error: error.message,
    });
  }
};

/**
 * Obtener Orden de Compra por ID
 * GET /api/ordenes-compra/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const orden = await OrdenCompraModel.obtenerOrdenCompraPorId(parseInt(id));

    if (!orden) {
      return res.status(404).json({
        success: false,
        mensaje: 'Orden de Compra no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: orden,
    });
  } catch (error: any) {
    console.error('Error al obtener Orden de Compra:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener Orden de Compra',
      error: error.message,
    });
  }
};

/**
 * Actualizar Orden de Compra
 * PUT /api/ordenes-compra/:id
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
    const { numero_orden, detalle, fecha_ingreso, activo } = req.body;

    // Verificar si la orden existe
    const ordenExistente = await OrdenCompraModel.obtenerOrdenCompraPorId(parseInt(id));
    if (!ordenExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Orden de Compra no encontrada',
      });
    }

    // Si se cambia el número de orden, verificar que no exista otro con ese número
    if (numero_orden && numero_orden !== ordenExistente.numero_orden) {
      const ordenConMismoNumero = await OrdenCompraModel.obtenerOrdenCompraPorNumero(numero_orden);
      if (ordenConMismoNumero) {
        return res.status(400).json({
          success: false,
          mensaje: 'El número de orden ya existe',
        });
      }
    }

    // Actualizar
    const actualizado = await OrdenCompraModel.actualizarOrdenCompra(parseInt(id), {
      numero_orden,
      detalle,
      fecha_ingreso,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar la Orden de Compra',
      });
    }

    // Obtener orden actualizada
    const ordenActualizada = await OrdenCompraModel.obtenerOrdenCompraPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Orden de Compra actualizada exitosamente',
      data: ordenActualizada,
    });
  } catch (error: any) {
    console.error('Error al actualizar Orden de Compra:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar Orden de Compra',
      error: error.message,
    });
  }
};

/**
 * Eliminar Orden de Compra (soft delete)
 * DELETE /api/ordenes-compra/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si la orden existe
    const ordenExistente = await OrdenCompraModel.obtenerOrdenCompraPorId(parseInt(id));
    if (!ordenExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Orden de Compra no encontrada',
      });
    }

    // Verificar si tiene equipos asociados
    const tieneEquipos = await OrdenCompraModel.tieneEquiposAsociados(parseInt(id));
    if (tieneEquipos) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se puede eliminar la orden porque tiene equipos asociados',
      });
    }

    // Soft delete
    const eliminado = await OrdenCompraModel.eliminarOrdenCompra(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar la Orden de Compra',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Orden de Compra eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar Orden de Compra:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar Orden de Compra',
      error: error.message,
    });
  }
};