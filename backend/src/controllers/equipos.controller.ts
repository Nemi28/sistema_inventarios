/**
 * Controlador Equipos
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as EquipoModel from '../models/equipos.model';

/**
 * Crear nuevo Equipo (individual)
 * POST /api/equipos
 * Roles: gestor, administrador
 */
export const crearEquipo = async (req: Request, res: Response) => {
  try {
    // Validar errores de express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const {
      orden_compra_id,
      categoria_id,
      nombre,
      marca,
      modelo,
      numero_serie,
      inv_entel,
      estado,
      observacion,
      activo,
      detalle,
    } = req.body;

    // Validar que la categoría exista
    const categoriaExiste = await EquipoModel.existeCategoriaPorId(categoria_id);
    if (!categoriaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'La categoría especificada no existe',
      });
    }

    // Validar que la orden de compra exista (si se proporciona)
    if (orden_compra_id) {
      const ordenExiste = await EquipoModel.existeOrdenCompraPorId(orden_compra_id);
      if (!ordenExiste) {
        return res.status(404).json({
          success: false,
          mensaje: 'La orden de compra especificada no existe',
        });
      }
    }

    // Crear equipo
    const equipoId = await EquipoModel.crearEquipo({
      orden_compra_id: orden_compra_id || null,
      categoria_id,
      nombre,
      marca,
      modelo,
      numero_serie: numero_serie || null,
      inv_entel: inv_entel || null,
      estado,
      observacion: observacion || null,
      activo: activo ?? true,
      detalle: detalle || null,
    });

    // Obtener equipo creado con relaciones
    const equipoCreado = await EquipoModel.obtenerEquipoPorId(equipoId);

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
 * Crear múltiples Equipos (registro masivo)
 * POST /api/equipos/multiple
 * Roles: gestor, administrador
 */
export const crearEquiposMultiple = async (req: Request, res: Response) => {
  try {
    // Validar errores de express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const { equipos } = req.body;

    // Validar que no exceda el límite
    if (!equipos || equipos.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe proporcionar al menos un equipo',
      });
    }

    if (equipos.length > 50) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pueden crear más de 50 equipos a la vez',
      });
    }

    // Validar que todas las categorías existan
    const categoriasIds = [...new Set(equipos.map((e: any) => e.categoria_id))] as number[];
    for (const categoriaId of categoriasIds) {
      const existe = await EquipoModel.existeCategoriaPorId(categoriaId);
      if (!existe) {
        return res.status(404).json({
          success: false,
          mensaje: `La categoría con ID ${categoriaId} no existe`,
        });
      }
    }

    // Validar que todas las órdenes de compra existan (si se proporcionan)
    const ordenesIds = [
      ...new Set(
        equipos
          .filter((e: any) => e.orden_compra_id)
          .map((e: any) => e.orden_compra_id)
      ),
    ] as number[];

    for (const ordenId of ordenesIds) {
      const existe = await EquipoModel.existeOrdenCompraPorId(ordenId);
      if (!existe) {
        return res.status(404).json({
          success: false,
          mensaje: `La orden de compra con ID ${ordenId} no existe`,
        });
      }
    }

    // Preparar equipos para inserción
    const equiposParaCrear = equipos.map((equipo: any) => ({
      orden_compra_id: equipo.orden_compra_id || null,
      categoria_id: equipo.categoria_id,
      nombre: equipo.nombre,
      marca: equipo.marca,
      modelo: equipo.modelo,
      numero_serie: equipo.numero_serie || null,
      inv_entel: equipo.inv_entel || null,
      estado: equipo.estado,
      observacion: equipo.observacion || null,
      activo: equipo.activo ?? true,
      detalle: equipo.detalle || null,
    }));

    // Crear equipos en transacción
    const equiposCreados = await EquipoModel.crearEquiposMultiple(equiposParaCrear);

    res.status(201).json({
      success: true,
      mensaje: `${equiposCreados.length} equipos creados exitosamente`,
      data: {
        cantidad: equiposCreados.length,
        ids: equiposCreados,
      },
    });
  } catch (error: any) {
    console.error('Error al crear equipos múltiples:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear los equipos. Se revirtieron todos los cambios.',
      error: error.message,
    });
  }
};

/**
 * Listar Equipos con paginación y filtros
 * GET /api/equipos
 * Roles: todos
 */
export const listarEquipos = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      activo,
      categoria_id,
      orden_compra_id,
      estado,
      ordenar_por,
      orden,
    } = req.query;

    const filtros: EquipoModel.FiltrosEquipo = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      categoria_id: categoria_id ? parseInt(categoria_id as string) : undefined,
      orden_compra_id: orden_compra_id ? parseInt(orden_compra_id as string) : undefined,
      estado: estado as string,
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
 * Buscar Equipos por término
 * GET /api/equipos/buscar?q=termino
 * Roles: todos
 */
export const buscarEquipos = async (req: Request, res: Response) => {
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
 * Obtener Equipo por ID
 * GET /api/equipos/:id
 * Roles: todos
 */
export const obtenerEquipoPorId = async (req: Request, res: Response) => {
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
 * Actualizar Equipo
 * PUT /api/equipos/:id
 * Roles: gestor, administrador
 */
export const actualizarEquipo = async (req: Request, res: Response) => {
  try {
    // Validar errores de express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Errores de validación',
        errores: errores.array(),
      });
    }

    const { id } = req.params;
    const equipoId = parseInt(id);

    // Verificar que el equipo exista
    const equipoExistente = await EquipoModel.obtenerEquipoPorId(equipoId);
    if (!equipoExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado',
      });
    }

    const datos = req.body;

    // Validar que la categoría exista (si se proporciona)
    if (datos.categoria_id) {
      const categoriaExiste = await EquipoModel.existeCategoriaPorId(datos.categoria_id);
      if (!categoriaExiste) {
        return res.status(404).json({
          success: false,
          mensaje: 'La categoría especificada no existe',
        });
      }
    }

    // Validar que la orden de compra exista (si se proporciona)
    if (datos.orden_compra_id) {
      const ordenExiste = await EquipoModel.existeOrdenCompraPorId(datos.orden_compra_id);
      if (!ordenExiste) {
        return res.status(404).json({
          success: false,
          mensaje: 'La orden de compra especificada no existe',
        });
      }
    }

    // Actualizar equipo
    const actualizado = await EquipoModel.actualizarEquipo(equipoId, datos);

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar el equipo',
      });
    }

    // Obtener equipo actualizado
    const equipoActualizado = await EquipoModel.obtenerEquipoPorId(equipoId);

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
 * Eliminar Equipo (soft delete)
 * DELETE /api/equipos/:id
 * Roles: solo administrador
 */
export const eliminarEquipo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const equipoId = parseInt(id);

    // Verificar que el equipo exista
    const equipoExistente = await EquipoModel.obtenerEquipoPorId(equipoId);
    if (!equipoExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado',
      });
    }

    // Soft delete
    const eliminado = await EquipoModel.eliminarEquipo(equipoId);

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