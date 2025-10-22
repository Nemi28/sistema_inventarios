/**
 * Controlador Tiendas
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as TiendaModel from '../models/tienda.model';

/**
 * Crear nueva Tienda
 * POST /api/tiendas
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

    const { pdv, tipo_local, perfil_local, nombre_tienda, socio_id, direccion, ubigeo, activo } = req.body;

    // Verificar que el socio exista
    const socioExiste = await TiendaModel.existeSocioPorId(socio_id);
    if (!socioExiste) {
      return res.status(404).json({
        success: false,
        mensaje: `El socio con ID ${socio_id} no existe`,
      });
    }

    // Verificar duplicados
    const tiendaPorPDV = await TiendaModel.obtenerTiendaPorPDV(pdv);
    if (tiendaPorPDV) {
      return res.status(400).json({
        success: false,
        mensaje: 'El PDV ya existe',
      });
    }

    const tiendaPorNombre = await TiendaModel.obtenerTiendaPorNombre(nombre_tienda);
    if (tiendaPorNombre) {
      return res.status(400).json({
        success: false,
        mensaje: 'El nombre de tienda ya existe',
      });
    }

    // Crear tienda
    const nuevoId = await TiendaModel.crearTienda({
      pdv,
      tipo_local,
      perfil_local,
      nombre_tienda,
      socio_id,
      direccion,
      ubigeo,
      activo: activo ?? true,
    });

    // Obtener tienda creada
    const tiendaCreada = await TiendaModel.obtenerTiendaPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Tienda creada exitosamente',
      data: tiendaCreada,
    });
  } catch (error: any) {
    console.error('Error al crear tienda:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear tienda',
      error: error.message,
    });
  }
};

/**
 * Listar tiendas con paginación y filtros
 * GET /api/tiendas
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { page, limit, activo, socio_id, tipo_local, perfil_local, ordenar_por, orden } = req.query;

    const filtros: TiendaModel.FiltrosTienda = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      socio_id: socio_id ? parseInt(socio_id as string) : undefined,
      tipo_local: tipo_local as string,
      perfil_local: perfil_local as string,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await TiendaModel.listarTiendas(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar tiendas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar tiendas',
      error: error.message,
    });
  }
};

/**
 * Buscar tiendas por término
 * GET /api/tiendas/buscar?q=termino
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

    const resultado = await TiendaModel.buscarTiendas(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar tiendas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar tiendas',
      error: error.message,
    });
  }
};

/**
 * Obtener tienda por ID
 * GET /api/tiendas/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tienda = await TiendaModel.obtenerTiendaPorId(parseInt(id));

    if (!tienda) {
      return res.status(404).json({
        success: false,
        mensaje: 'Tienda no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: tienda,
    });
  } catch (error: any) {
    console.error('Error al obtener tienda:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener tienda',
      error: error.message,
    });
  }
};

/**
 * Actualizar tienda
 * PUT /api/tiendas/:id
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
    const { pdv, tipo_local, perfil_local, nombre_tienda, socio_id, direccion, ubigeo, activo } = req.body;

    // Verificar si existe
    const tiendaExistente = await TiendaModel.obtenerTiendaPorId(parseInt(id));
    if (!tiendaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Tienda no encontrada',
      });
    }

    // Si se está actualizando el socio_id, verificar que exista
    if (socio_id && socio_id !== tiendaExistente.socio_id) {
      const socioExiste = await TiendaModel.existeSocioPorId(socio_id);
      if (!socioExiste) {
        return res.status(404).json({
          success: false,
          mensaje: `El socio con ID ${socio_id} no existe`,
        });
      }
    }

    // Validar PDV duplicado
    if (pdv && pdv !== tiendaExistente.pdv) {
      const tiendaConMismoPDV = await TiendaModel.obtenerTiendaPorPDV(pdv);
      if (tiendaConMismoPDV) {
        return res.status(400).json({
          success: false,
          mensaje: 'El PDV ya existe',
        });
      }
    }

    // Validar nombre duplicado
    if (nombre_tienda && nombre_tienda !== tiendaExistente.nombre_tienda) {
      const tiendaConMismoNombre = await TiendaModel.obtenerTiendaPorNombre(nombre_tienda);
      if (tiendaConMismoNombre) {
        return res.status(400).json({
          success: false,
          mensaje: 'El nombre de tienda ya existe',
        });
      }
    }

    // Actualizar
    const actualizado = await TiendaModel.actualizarTienda(parseInt(id), {
      pdv,
      tipo_local,
      perfil_local,
      nombre_tienda,
      socio_id,
      direccion,
      ubigeo,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar la tienda',
      });
    }

    // Obtener tienda actualizada
    const tiendaActualizada = await TiendaModel.obtenerTiendaPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Tienda actualizada exitosamente',
      data: tiendaActualizada,
    });
  } catch (error: any) {
    console.error('Error al actualizar tienda:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar tienda',
      error: error.message,
    });
  }
};

/**
 * Eliminar tienda (soft delete)
 * DELETE /api/tiendas/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const tiendaExistente = await TiendaModel.obtenerTiendaPorId(parseInt(id));
    if (!tiendaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Tienda no encontrada',
      });
    }

    // Soft delete
    const eliminado = await TiendaModel.eliminarTienda(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar la tienda',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Tienda eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar tienda:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar tienda',
      error: error.message,
    });
  }
};