/**
 * Controlador Categorias
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as CategoriaModel from '../models/categoria.model';

/**
 * Crear nueva Categoria
 * POST /api/categorias
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
    const categoriaExistente = await CategoriaModel.obtenerCategoriaPorNombre(nombre);
    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'El nombre de categoría ya existe',
      });
    }

    // Crear categoria
    const nuevoId = await CategoriaModel.crearCategoria({
      nombre,
      activo: activo ?? true,
    });

    // Obtener la categoria creada
    const categoriaCreada = await CategoriaModel.obtenerCategoriaPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Categoría creada exitosamente',
      data: categoriaCreada,
    });
  } catch (error: any) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear categoría',
      error: error.message,
    });
  }
};

/**
 * Listar Categorias con paginación y filtros
 * GET /api/categorias
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { page, limit, activo, nombre, ordenar_por, orden } = req.query;

    const filtros: CategoriaModel.FiltrosCategoria = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      nombre: nombre as string,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await CategoriaModel.listarCategorias(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar categorías',
      error: error.message,
    });
  }
};

/**
 * Buscar Categorias por termino
 * GET /api/categorias/buscar?q=termino
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

    const resultado = await CategoriaModel.buscarCategorias(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar categorías:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar categorías',
      error: error.message,
    });
  }
};

/**
 * Obtener Categoria por ID
 * GET /api/categorias/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const categoria = await CategoriaModel.obtenerCategoriaPorId(parseInt(id));

    if (!categoria) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: categoria,
    });
  } catch (error: any) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener categoría',
      error: error.message,
    });
  }
};

/**
 * Actualizar Categoria
 * PUT /api/categorias/:id
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

    // Verificar si la categoria existe
    const categoriaExistente = await CategoriaModel.obtenerCategoriaPorId(parseInt(id));
    if (!categoriaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada',
      });
    }

    // Si se cambia el nombre, verificar que no exista otro con ese nombre
    if (nombre && nombre !== categoriaExistente.nombre) {
      const categoriaConMismoNombre = await CategoriaModel.obtenerCategoriaPorNombre(nombre);
      if (categoriaConMismoNombre) {
        return res.status(400).json({
          success: false,
          mensaje: 'El nombre de categoría ya existe',
        });
      }
    }

    // Actualizar
    const actualizado = await CategoriaModel.actualizarCategoria(parseInt(id), {
      nombre,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar la categoría',
      });
    }

    // Obtener categoria actualizada
    const categoriaActualizada = await CategoriaModel.obtenerCategoriaPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Categoría actualizada exitosamente',
      data: categoriaActualizada,
    });
  } catch (error: any) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar categoría',
      error: error.message,
    });
  }
};

/**
 * Eliminar categoria (soft delete)
 * DELETE /api/categorias/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si la categoria existe
    const categoriaExistente = await CategoriaModel.obtenerCategoriaPorId(parseInt(id));
    if (!categoriaExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada',
      });
    }

    // Soft delete
    const eliminado = await CategoriaModel.eliminarCategoria(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar la categoría',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Categoría eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar categoría',
      error: error.message,
    });
  }
};