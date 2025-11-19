/**
 * Controlador Equipos
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as EquipoModel from '../models/equipos.model';

/**
 * Crear nuevo Equipo
 * POST /api/equipos
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

    const equipoData = req.body;

    // Crear equipo
    const nuevoId = await EquipoModel.crearEquipo(equipoData);

    // Obtener equipo creado
    const equipoCreado = await EquipoModel.obtenerEquipoPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Equipo creado exitosamente',
      data: equipoCreado,
    });
  } catch (error: any) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear equipo',
      error: error.message,
    });
  }
};

/**
 * Listar equipos con paginación y filtros
 * GET /api/equipos
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      activo,
      modelo_id,
      estado_actual,
      ubicacion_actual,
      tienda_id,
      tipo_propiedad,
      garantia,
      es_accesorio,
      ordenar_por,
      orden,
    } = req.query;

    const filtros: EquipoModel.FiltrosEquipo = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      modelo_id: modelo_id ? parseInt(modelo_id as string) : undefined,
      estado_actual: estado_actual as string,
      ubicacion_actual: ubicacion_actual as string,
      tienda_id: tienda_id ? parseInt(tienda_id as string) : undefined,
      tipo_propiedad: tipo_propiedad as string,
      garantia: garantia === 'true' ? true : garantia === 'false' ? false : undefined,
      es_accesorio: es_accesorio === 'true' ? true : es_accesorio === 'false' ? false : undefined,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await EquipoModel.listarEquipos(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar equipos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar equipos',
      error: error.message,
    });
  }
};

/**
 * Buscar equipos por término
 * GET /api/equipos/buscar?q=termino
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

    const resultado = await EquipoModel.buscarEquipos(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar equipos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar equipos',
      error: error.message,
    });
  }
};

/**
 * Obtener equipo por ID
 * GET /api/equipos/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const equipo = await EquipoModel.obtenerEquipoPorId(parseInt(id));

    if (!equipo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: equipo,
    });
  } catch (error: any) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener equipo',
      error: error.message,
    });
  }
};

/**
 * Actualizar equipo
 * PUT /api/equipos/:id
 * Roles: gestor, administrador
 */
export const actualizar = async (req: Request, res: Response) => {
  try {
    // Validar datos
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const { id } = req.params;
    const datos = req.body;

    // Verificar si existe
    const equipoExistente = await EquipoModel.obtenerEquipoPorId(parseInt(id));
    if (!equipoExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado',
      });
    }

    // Validar inv_entel único (si se está actualizando)
    if (datos.inv_entel && datos.inv_entel !== equipoExistente.inv_entel) {
      const equipoConMismoInv = await EquipoModel.obtenerEquipoPorInvEntel(datos.inv_entel);
      if (equipoConMismoInv && equipoConMismoInv.id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe un equipo con ese código de inventario Entel',
        });
      }
    }

    // Actualizar
    const actualizado = await EquipoModel.actualizarEquipo(parseInt(id), datos);

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar el equipo',
      });
    }

    // Obtener equipo actualizado
    const equipoActualizado = await EquipoModel.obtenerEquipoPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Equipo actualizado exitosamente',
      data: equipoActualizado,
    });
  } catch (error: any) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar equipo',
      error: error.message,
    });
  }
};

/**
 * Eliminar equipo (soft delete)
 * DELETE /api/equipos/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const equipoExistente = await EquipoModel.obtenerEquipoPorId(parseInt(id));
    if (!equipoExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado',
      });
    }

    // Soft delete
    const eliminado = await EquipoModel.eliminarEquipo(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar el equipo',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Equipo eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar equipo',
      error: error.message,
    });
  }
};