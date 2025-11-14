/**
 * Controlador Marcas
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as MarcaModel from '../models/marca.model';

/**
 * Crear nueva Marca
 * POST /api/marcas
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

    const { nombre, activo } = req.body;

    // Verificar si el nombre ya existe
    const marcaExistente = await MarcaModel.obtenerMarcaPorNombre(nombre);
    if (marcaExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'El nombre de marca ya existe',
      });
    }

    // Crear marca
    const nuevoId = await MarcaModel.crearMarca({
      nombre,
      activo: activo ?? true,
    });

    // Obtener la marca creada
    const marcaCreada = await MarcaModel.obtenerMarcaPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Marca creada exitosamente',
      data: marcaCreada,
    });
  } catch (error: any) {
    console.error('Error al crear marca:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear marca',
      error: error.message,
    });
  }
};

/**
 * Listar Marcas con paginación y filtros
 * GET /api/marcas
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { page, limit, activo, nombre, ordenar_por, orden } = req.query;

    const filtros: MarcaModel.FiltrosMarca = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      nombre: nombre as string,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await MarcaModel.listarMarcas(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar marcas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar marcas',
      error: error.message,
    });
  }
};

/**
 * Buscar Marcas por termino
 * GET /api/marcas/buscar?q=termino
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

    const resultado = await MarcaModel.buscarMarcas(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar marcas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar marcas',
      error: error.message,
    });
  }
};

/**
 * Obtener Marca por ID
 * GET /api/marcas/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const marca = await MarcaModel.obtenerMarcaPorId(parseInt(id));

    if (!marca) {
      return res.status(404).json({
        success: false,
        mensaje: 'Marca no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: marca,
    });
  } catch (error: any) {
    console.error('Error al obtener marca:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener marca',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las marcas activas (para selects)
 * GET /api/marcas/activas
 * Roles: todos
 */
export const obtenerActivas = async (req: Request, res: Response) => {
  try {
    const marcas = await MarcaModel.obtenerMarcasActivas();

    res.status(200).json({
      success: true,
      data: marcas,
    });
  } catch (error: any) {
    console.error('Error al obtener marcas activas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener marcas activas',
      error: error.message,
    });
  }
};

/**
 * Actualizar Marca
 * PUT /api/marcas/:id
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
    const { nombre, activo } = req.body;

    // Verificar si la marca existe
    const marcaExistente = await MarcaModel.obtenerMarcaPorId(parseInt(id));
    if (!marcaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Marca no encontrada',
      });
    }

    // Si se cambia el nombre, verificar que no exista otro con ese nombre
    if (nombre && nombre !== marcaExistente.nombre) {
      const marcaConMismoNombre = await MarcaModel.obtenerMarcaPorNombre(nombre);
      if (marcaConMismoNombre) {
        return res.status(400).json({
          success: false,
          mensaje: 'El nombre de marca ya existe',
        });
      }
    }

    // Actualizar
    const actualizado = await MarcaModel.actualizarMarca(parseInt(id), {
      nombre,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar la marca',
      });
    }

    // Obtener marca actualizada
    const marcaActualizada = await MarcaModel.obtenerMarcaPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Marca actualizada exitosamente',
      data: marcaActualizada,
    });
  } catch (error: any) {
    console.error('Error al actualizar marca:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar marca',
      error: error.message,
    });
  }
};

/**
 * Eliminar marca (soft delete)
 * DELETE /api/marcas/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si la marca existe
    const marcaExistente = await MarcaModel.obtenerMarcaPorId(parseInt(id));
    if (!marcaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Marca no encontrada',
      });
    }

    // Soft delete
    const eliminado = await MarcaModel.eliminarMarca(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar la marca',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Marca eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar marca:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar marca',
      error: error.message,
    });
  }
};
/**
 * Obtener marcas que tienen modelos en una subcategoría específica
 * GET /api/marcas/por-subcategoria/:subcategoriaId
 * Roles: todos
 */
export const obtenerMarcasPorSubcategoria = async (req: Request, res: Response) => {
  try {
    const { subcategoriaId } = req.params;

    const marcas = await MarcaModel.obtenerMarcasPorSubcategoria(parseInt(subcategoriaId));

    res.status(200).json({
      success: true,
      data: marcas,
    });
  } catch (error: any) {
    console.error('Error al obtener marcas por subcategoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener marcas',
      error: error.message,
    });
  }
};