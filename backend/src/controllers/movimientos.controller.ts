/**
 * Controlador Movimientos
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as MovimientoModel from '../models/movimientos.model';

/**
 * Crear movimiento (uno o múltiples equipos)
 * POST /api/movimientos
 * Roles: gestor, administrador
 */
export const crear = async (req: Request, res: Response) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const { equipos_ids, ...datosMovimiento } = req.body;

    if (!equipos_ids || !Array.isArray(equipos_ids) || equipos_ids.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe proporcionar al menos un equipo para mover',
      });
    }

    // ✅ CAMBIAR DE req.usuario A req.user
    const usuario = (req as any).user;
    
    if (!usuario || !usuario.id) {
      return res.status(401).json({
        success: false,
        mensaje: 'Usuario no autenticado',
      });
    }

    // Agregar usuario_id del token
    datosMovimiento.usuario_id = usuario.id;

    const resultado = await MovimientoModel.crearMovimientos(equipos_ids, datosMovimiento);

    const mensaje =
      resultado.cantidad === 1
        ? 'Movimiento registrado exitosamente'
        : `${resultado.cantidad} equipos movidos exitosamente`;

    res.status(201).json({
      success: true,
      mensaje,
      data: {
        cantidad: resultado.cantidad,
        movimientos_ids: resultado.movimientos_ids,
        codigo_acta: datosMovimiento.codigo_acta,
      },
    });
  } catch (error: any) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear movimiento',
      error: error.message,
    });
  }
};

/**
 * Listar movimientos con filtros
 * GET /api/movimientos
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      equipo_id,
      tipo_movimiento,
      estado_movimiento,
      ubicacion_origen,
      ubicacion_destino,
      tienda_origen_id,
      tienda_destino_id,
      fecha_desde,
      fecha_hasta,
      codigo_acta,
      ordenar_por,
      orden,
    } = req.query;

    const filtros: MovimientoModel.FiltrosMovimiento = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      equipo_id: equipo_id ? parseInt(equipo_id as string) : undefined,
      tipo_movimiento: tipo_movimiento as string,
      estado_movimiento: estado_movimiento as string,
      ubicacion_origen: ubicacion_origen as string,
      ubicacion_destino: ubicacion_destino as string,
      tienda_origen_id: tienda_origen_id ? parseInt(tienda_origen_id as string) : undefined,
      tienda_destino_id: tienda_destino_id ? parseInt(tienda_destino_id as string) : undefined,
      fecha_desde: fecha_desde as string,
      fecha_hasta: fecha_hasta as string,
      codigo_acta: codigo_acta as string,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await MovimientoModel.listarMovimientos(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar movimientos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar movimientos',
      error: error.message,
    });
  }
};

/**
 * Obtener historial de un equipo
 * GET /api/movimientos/equipo/:equipoId
 * Roles: todos
 */
export const obtenerHistorialEquipo = async (req: Request, res: Response) => {
  try {
    const { equipoId } = req.params;

    const historial = await MovimientoModel.obtenerHistorialEquipo(parseInt(equipoId));

    res.status(200).json({
      success: true,
      data: historial,
    });
  } catch (error: any) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener historial',
      error: error.message,
    });
  }
};

/**
 * Obtener movimiento por ID
 * GET /api/movimientos/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const movimiento = await MovimientoModel.obtenerMovimientoPorId(parseInt(id));

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        mensaje: 'Movimiento no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: movimiento,
    });
  } catch (error: any) {
    console.error('Error al obtener movimiento:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener movimiento',
      error: error.message,
    });
  }
};

/**
 * Actualizar estado de movimiento
 * PATCH /api/movimientos/:id/estado
 * Roles: gestor, administrador
 */
export const actualizarEstado = async (req: Request, res: Response) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const { id } = req.params;
    const { estado_movimiento, fecha_llegada, codigo_acta } = req.body;

    const actualizado = await MovimientoModel.actualizarEstadoMovimiento(
      parseInt(id),
      estado_movimiento,
      fecha_llegada,
      codigo_acta
    );

    if (!actualizado) {
      return res.status(404).json({
        success: false,
        mensaje: 'Movimiento no encontrado',
      });
    }

    const movimientoActualizado = await MovimientoModel.obtenerMovimientoPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Estado actualizado exitosamente',
      data: movimientoActualizado,
    });
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar estado',
      error: error.message,
    });
  }
};