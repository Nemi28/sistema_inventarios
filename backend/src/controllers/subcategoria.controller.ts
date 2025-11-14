/**
 * Controlador Subcategorías
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as SubcategoriaModel from '../models/subcategoria.model';
import * as CategoriaModel from '../models/categoria.model';

/**
 * Crear nueva Subcategoría
 * POST /api/subcategorias
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

    const { categoria_id, nombre, activo } = req.body;

    // Verificar que la categoría existe
    const categoriaExiste = await CategoriaModel.obtenerCategoriaPorId(categoria_id);
    if (!categoriaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'La categoría especificada no existe',
      });
    }

    // Verificar si ya existe subcategoría con ese nombre en esa categoría
    const existe = await SubcategoriaModel.existeSubcategoria(nombre, categoria_id);
    if (existe) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe una subcategoría con ese nombre en esta categoría',
      });
    }

    // Crear subcategoría
    const nuevoId = await SubcategoriaModel.crearSubcategoria({
      categoria_id,
      nombre,
      activo: activo ?? true,
    });

    // Obtener la subcategoría creada
    const subcategoriaCreada = await SubcategoriaModel.obtenerSubcategoriaPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Subcategoría creada exitosamente',
      data: subcategoriaCreada,
    });
  } catch (error: any) {
    console.error('Error al crear subcategoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear subcategoría',
      error: error.message,
    });
  }
};

/**
 * Listar Subcategorías con paginación y filtros
 * GET /api/subcategorias
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { page, limit, activo, nombre, categoria_id, ordenar_por, orden } = req.query;

    const filtros: SubcategoriaModel.FiltrosSubcategoria = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      nombre: nombre as string,
      categoria_id: categoria_id ? parseInt(categoria_id as string) : undefined,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await SubcategoriaModel.listarSubcategorias(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar subcategorías:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar subcategorías',
      error: error.message,
    });
  }
};

/**
 * Buscar Subcategorías por término
 * GET /api/subcategorias/buscar?q=termino
 * Roles: todos
 */
export const buscar = async (req: Request, res: Response) => {
  try {
    const { q, page, limit, categoria_id } = req.query;

    if (!q || (q as string).trim() === '') {
      return res.status(400).json({
        success: false,
        mensaje: 'El parámetro de búsqueda "q" es requerido',
      });
    }

    const filtros: SubcategoriaModel.FiltrosSubcategoria = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      categoria_id: categoria_id ? parseInt(categoria_id as string) : undefined,
    };

    const resultado = await SubcategoriaModel.buscarSubcategorias(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar subcategorías:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar subcategorías',
      error: error.message,
    });
  }
};

/**
 * Obtener Subcategoría por ID
 * GET /api/subcategorias/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subcategoria = await SubcategoriaModel.obtenerSubcategoriaPorId(parseInt(id));

    if (!subcategoria) {
      return res.status(404).json({
        success: false,
        mensaje: 'Subcategoría no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: subcategoria,
    });
  } catch (error: any) {
    console.error('Error al obtener subcategoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener subcategoría',
      error: error.message,
    });
  }
};

/**
 * Obtener subcategorías por categoría (para selects)
 * GET /api/subcategorias/categoria/:categoriaId
 * Roles: todos
 */
export const obtenerPorCategoria = async (req: Request, res: Response) => {
  try {
    const { categoriaId } = req.params;

    const subcategorias = await SubcategoriaModel.obtenerSubcategoriasPorCategoria(
      parseInt(categoriaId)
    );

    res.status(200).json({
      success: true,
      data: subcategorias,
    });
  } catch (error: any) {
    console.error('Error al obtener subcategorías por categoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener subcategorías',
      error: error.message,
    });
  }
};

/**
 * Actualizar Subcategoría
 * PUT /api/subcategorias/:id
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
    const { categoria_id, nombre, activo } = req.body;

    // Verificar si la subcategoría existe
    const subcategoriaExistente = await SubcategoriaModel.obtenerSubcategoriaPorId(parseInt(id));
    if (!subcategoriaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Subcategoría no encontrada',
      });
    }

    // Si se cambia la categoría, verificar que existe
    if (categoria_id && categoria_id !== subcategoriaExistente.categoria_id) {
      const categoriaExiste = await CategoriaModel.obtenerCategoriaPorId(categoria_id);
      if (!categoriaExiste) {
        return res.status(404).json({
          success: false,
          mensaje: 'La categoría especificada no existe',
        });
      }
    }

    // Verificar duplicados
    const categoriaFinal = categoria_id || subcategoriaExistente.categoria_id;
    const nombreFinal = nombre || subcategoriaExistente.nombre;

    if (nombre || categoria_id) {
      const existe = await SubcategoriaModel.existeSubcategoria(
        nombreFinal,
        categoriaFinal,
        parseInt(id)
      );
      if (existe) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe una subcategoría con ese nombre en esta categoría',
        });
      }
    }

    // Actualizar
    const actualizado = await SubcategoriaModel.actualizarSubcategoria(parseInt(id), {
      categoria_id,
      nombre,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar la subcategoría',
      });
    }

    // Obtener subcategoría actualizada
    const subcategoriaActualizada = await SubcategoriaModel.obtenerSubcategoriaPorId(
      parseInt(id)
    );

    res.status(200).json({
      success: true,
      mensaje: 'Subcategoría actualizada exitosamente',
      data: subcategoriaActualizada,
    });
  } catch (error: any) {
    console.error('Error al actualizar subcategoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar subcategoría',
      error: error.message,
    });
  }
};

/**
 * Eliminar subcategoría (soft delete)
 * DELETE /api/subcategorias/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si la subcategoría existe
    const subcategoriaExistente = await SubcategoriaModel.obtenerSubcategoriaPorId(parseInt(id));
    if (!subcategoriaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Subcategoría no encontrada',
      });
    }

    // Soft delete
    const eliminado = await SubcategoriaModel.eliminarSubcategoria(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar la subcategoría',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Subcategoría eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar subcategoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar subcategoría',
      error: error.message,
    });
  }
};