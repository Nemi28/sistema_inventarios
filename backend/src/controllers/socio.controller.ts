/**
 * Controlador Socios
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as SocioModel from '../models/socio.model';

/**
 * Crear nuevo Socio
 * POST /api/socios
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

    const { razon_social, ruc, direccion, activo } = req.body;

    // Verificar duplicados
    const socioRazon = await SocioModel.obtenerSocioPorRuc(ruc);
    if (socioRazon) {
      return res.status(400).json({
        success: false,
        mensaje: 'El RUC ya existe',
      });
    }

    // Crear socio
    const nuevoId = await SocioModel.crearSocio({
      razon_social,
      ruc,
      direccion,
      activo: activo ?? true,
    });

    // Obtener socio creado
    const socioCreado = await SocioModel.obtenerSocioPorId(nuevoId);

    res.status(201).json({
      success: true,
      mensaje: 'Socio creado exitosamente',
      data: socioCreado,
    });
  } catch (error: any) {
    console.error('Error al crear socio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear socio',
      error: error.message,
    });
  }
};

/**
 * Listar socios con paginación y filtros
 * GET /api/socios
 * Roles: todos
 */
export const listar = async (req: Request, res: Response) => {
  try {
    const { page, limit, activo, razon_social, ruc, ordenar_por, orden } = req.query;

    const filtros: SocioModel.FiltrosSocio = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      razon_social: razon_social as string,
      ruc: ruc as string,
      ordenar_por: ordenar_por as string,
      orden: orden as string,
    };

    const resultado = await SocioModel.listarSocios(filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al listar socios:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al listar socios',
      error: error.message,
    });
  }
};

/**
 * Buscar socios por término
 * GET /api/socios/buscar?q=termino
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

    const resultado = await SocioModel.buscarSocios(q as string, filtros);

    res.status(200).json({
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    });
  } catch (error: any) {
    console.error('Error al buscar socios:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al buscar socios',
      error: error.message,
    });
  }
};

/**
 * Obtener socio por ID
 * GET /api/socios/:id
 * Roles: todos
 */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const socio = await SocioModel.obtenerSocioPorId(parseInt(id));

    if (!socio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Socio no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: socio,
    });
  } catch (error: any) {
    console.error('Error al obtener socio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener socio',
      error: error.message,
    });
  }
};

/**
 * Actualizar socio
 * PUT /api/socios/:id
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
    const { razon_social, ruc, direccion, activo } = req.body;

    // Verificar si existe
    const socioExistente = await SocioModel.obtenerSocioPorId(parseInt(id));
    if (!socioExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Socio no encontrado',
      });
    }

    // Validar RUC duplicado
    if (ruc && ruc !== socioExistente.ruc) {
      const socioConMismoRuc = await SocioModel.obtenerSocioPorRuc(ruc);
      if (socioConMismoRuc) {
        return res.status(400).json({
          success: false,
          mensaje: 'El RUC ya existe',
        });
      }
    }

    // Actualizar
    const actualizado = await SocioModel.actualizarSocio(parseInt(id), {
      razon_social,
      ruc,
      direccion,
      activo,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo actualizar el socio',
      });
    }

    // Obtener socio actualizado
    const socioActualizado = await SocioModel.obtenerSocioPorId(parseInt(id));

    res.status(200).json({
      success: true,
      mensaje: 'Socio actualizado exitosamente',
      data: socioActualizado,
    });
  } catch (error: any) {
    console.error('Error al actualizar socio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar socio',
      error: error.message,
    });
  }
};

/**
 * Eliminar socio (soft delete)
 * DELETE /api/socios/:id
 * Roles: solo administrador
 */
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const socioExistente = await SocioModel.obtenerSocioPorId(parseInt(id));
    if (!socioExistente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Socio no encontrado',
      });
    }

    // Soft delete
    const eliminado = await SocioModel.eliminarSocio(parseInt(id));

    if (!eliminado) {
      return res.status(400).json({
        success: false,
        mensaje: 'No se pudo eliminar el socio',
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Socio eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar socio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar socio',
      error: error.message,
    });
  }
};
