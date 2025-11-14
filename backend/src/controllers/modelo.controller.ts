/**
 * Controlador Modelos
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as ModeloModel from '../models/modelo.model';
import * as SubcategoriaModel from '../models/subcategoria.model';
import * as MarcaModel from '../models/marca.model';

/**
 * Crear nuevo Modelo
 * POST /api/modelos
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

    const { subcategoria_id, marca_id, nombre, especificaciones_tecnicas, activo } = req.body;

    // Verificar que la subcategoría existe
    const subcategoriaExiste = await SubcategoriaModel.obtenerSubcategoriaPorId(subcategoria_id);
    if (!subcategoriaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'La subcategoría especificada no existe',
      });
    }

    // Verificar que la marca existe
    const marcaExiste = await MarcaModel.obtenerMarcaPorId(marca_id);
    if (!marcaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'La marca especificada no existe',
      });
    }

    // Verificar si ya existe modelo con ese nombre para esa subcategoría y marca
    const existe = await ModeloModel.existeModelo(nombre, subcategoria_id, marca_id);
    if (existe) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un modelo con ese nombre para esta subcategoría y marca',
      });
    }

    // Crear modelo
    const nuevoId = await ModeloModel.crearModelo({
      subcategoria_id,
      marca_id,
      nombre,
      especificaciones_tecnicas,
      activo: activo ?? true,
    });

    // Obtener el modelo creado
    const modeloCreado = await ModeloModel.obtenerModeloPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Modelo creado exitosamente',
      data: modeloCreado,
    });
  } catch (error: any) {
    console.error('Error al crear modelo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear modelo',
      error: error.message,
    });
  }
};

/**
 * Listar Modelos con paginación y filtros
 * GET /api/modelos
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { 
      page, 
      limit, 
      activo, 
      nombre, 
      subcategoria_id, 
      marca_id, 
      categoria_id,
      ordenar_por, 
      orden 
    } = req.query;

    const filtros: ModeloModel.FiltrosModelo = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      nombre: nombre as string,
      subcategoria_id: subcategoria_id ? parseInt(subcategoria_id as string) : undefined,
      marca_id: marca_id ? parseInt(marca_id as string) : undefined,
      categoria_id: categoria_id ? parseInt(categoria_id as string) : undefined,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await ModeloModel.listarModelos(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar modelos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar modelos',
      error: error.message,
    });
  }
};

/**
 * Buscar Modelos por término
 * GET /api/modelos/buscar?q=termino
 * Roles: todos
 */
export const buscar = async (req: Request, res: Response) => {
  try {
    const { q, page, limit, subcategoria_id, marca_id, categoria_id } = req.query;

    if (!q || (q as string).trim() === '') {
      return res.status(400).json({
        success: false,
        mensaje: 'El parámetro de búsqueda "q" es requerido',
      });
    }

    const filtros: ModeloModel.FiltrosModelo = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      subcategoria_id: subcategoria_id ? parseInt(subcategoria_id as string) : undefined,
      marca_id: marca_id ? parseInt(marca_id as string) : undefined,
      categoria_id: categoria_id ? parseInt(categoria_id as string) : undefined,
    };

    const resultado = await ModeloModel.buscarModelos(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar modelos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar modelos',
      error: error.message,
    });
  }
};

/**
 * Obtener Modelo por ID
 * GET /api/modelos/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const modelo = await ModeloModel.obtenerModeloPorId(parseInt(id));

    if (!modelo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Modelo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: modelo,
    });
  } catch (error: any) {
    console.error('Error al obtener modelo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener modelo',
      error: error.message,
    });
  }
};

/**
 * Obtener modelos por subcategoría (para selects)
 * GET /api/modelos/subcategoria/:subcategoriaId
 * Roles: todos
 */
export const obtenerPorSubcategoria = async (req: Request, res: Response) => {
  try {
    const { subcategoriaId } = req.params;

    const modelos = await ModeloModel.obtenerModelosPorSubcategoria(parseInt(subcategoriaId));

    res.status(200).json({
      success: true,
      data: modelos,
    });
  } catch (error: any) {
    console.error('Error al obtener modelos por subcategoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener modelos',
      error: error.message,
    });
  }
};

/**
 * Actualizar Modelo
 * PUT /api/modelos/:id
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
    const { subcategoria_id, marca_id, nombre, especificaciones_tecnicas, activo } = req.body;

    // Verificar si el modelo existe
    const modeloExistente = await ModeloModel.obtenerModeloPorId(parseInt(id));
    if (!modeloExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Modelo no encontrado',
      });
    }

    // Si se cambia la subcategoría, verificar que existe
    if (subcategoria_id && subcategoria_id !== modeloExistente.subcategoria_id) {
      const subcategoriaExiste = await SubcategoriaModel.obtenerSubcategoriaPorId(subcategoria_id);
      if (!subcategoriaExiste) {
        return res.status(404).json({
          success: false,
          mensaje: 'La subcategoría especificada no existe',
        });
      }
    }

    // Si se cambia la marca, verificar que existe
    if (marca_id && marca_id !== modeloExistente.marca_id) {
      const marcaExiste = await MarcaModel.obtenerMarcaPorId(marca_id);
      if (!marcaExiste) {
        return res.status(404).json({
          success: false,
          mensaje: 'La marca especificada no existe',
        });
      }
    }

    // Verificar duplicados
    const subcategoriaFinal = subcategoria_id || modeloExistente.subcategoria_id;
    const marcaFinal = marca_id || modeloExistente.marca_id;
    const nombreFinal = nombre || modeloExistente.nombre;

    if (nombre || subcategoria_id || marca_id) {
      const existe = await ModeloModel.existeModelo(
        nombreFinal,
        subcategoriaFinal,
        marcaFinal,
        parseInt(id)
      );
      if (existe) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe un modelo con ese nombre para esta subcategoría y marca',
        });
      }
    }

    // Actualizar
    const actualizado = await ModeloModel.actualizarModelo(parseInt(id), {
      subcategoria_id,
      marca_id,
      nombre,
      especificaciones_tecnicas,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar el modelo',
      });
    }

    // Obtener modelo actualizado
    const modeloActualizado = await ModeloModel.obtenerModeloPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Modelo actualizado exitosamente',
      data: modeloActualizado,
    });
  } catch (error: any) {
    console.error('Error al actualizar modelo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar modelo',
      error: error.message,
    });
  }
};

/**
 * Eliminar modelo (soft delete)
 * DELETE /api/modelos/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si el modelo existe
    const modeloExistente = await ModeloModel.obtenerModeloPorId(parseInt(id));
    if (!modeloExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Modelo no encontrado',
      });
    }

    // Soft delete
    const eliminado = await ModeloModel.eliminarModelo(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar el modelo',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Modelo eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar modelo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar modelo',
      error: error.message,
    });
  }
};

/**
 * Obtener modelos por marca y subcategoría (para combos escalonados)
 * GET /api/modelos/por-marca-subcategoria/:marcaId/:subcategoriaId
 * Roles: todos
 */
export const obtenerModelosPorMarcaYSubcategoria = async (req: Request, res: Response) => {
  try {
    const { marcaId, subcategoriaId } = req.params;

    const modelos = await ModeloModel.obtenerModelosPorMarcaYSubcategoria(
      parseInt(marcaId),
      parseInt(subcategoriaId)
    );

    res.status(200).json({
      success: true,
      data: modelos,
    });
  } catch (error: any) {
    console.error('Error al obtener modelos por marca y subcategoría:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener modelos',
      error: error.message,
    });
  }
};