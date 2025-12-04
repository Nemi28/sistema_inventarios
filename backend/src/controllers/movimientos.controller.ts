/**
 * Controlador Movimientos
 * Sistema de Gestión de Inventarios
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as MovimientoModel from '../models/movimientos.model';
import ExcelJS from 'exceljs';

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

    const { equipos_ids, instalaciones_accesorios, ...datosMovimiento } = req.body;

    if (!equipos_ids || !Array.isArray(equipos_ids) || equipos_ids.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe proporcionar al menos un equipo para mover',
      });
    }

    const usuario = (req as any).user;
    
    if (!usuario || !usuario.id) {
      return res.status(401).json({
        success: false,
        mensaje: 'Usuario no autenticado',
      });
    }

    datosMovimiento.usuario_id = usuario.id;

    const resultado = await MovimientoModel.crearMovimientos(equipos_ids, datosMovimiento, instalaciones_accesorios);

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
      busqueda, // ← NUEVO
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
      busqueda: busqueda as string, // ← NUEVO
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

/**
 * Validar ubicación de equipos antes de mover
 * POST /api/movimientos/validar-ubicacion
 * Body: { equipos_ids: number[], ubicacion_esperada: string, tienda_id?: number }
 * Roles: todos
 */
export const validarUbicacion = async (req: Request, res: Response) => {
  try {
    const { equipos_ids, ubicacion_esperada, tienda_id } = req.body;

    if (!equipos_ids || !Array.isArray(equipos_ids) || equipos_ids.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe proporcionar al menos un equipo para validar',
      });
    }

    if (!ubicacion_esperada || !['ALMACEN', 'TIENDA', 'PERSONA'].includes(ubicacion_esperada)) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ubicación esperada inválida. Debe ser ALMACEN, TIENDA o PERSONA',
      });
    }

    const resultado = await MovimientoModel.validarUbicacionEquipos(
      equipos_ids,
      ubicacion_esperada as 'ALMACEN' | 'TIENDA' | 'PERSONA',
      tienda_id
    );

    res.status(200).json({
      success: true,
      data: resultado,
    });
  } catch (error: any) {
    console.error('Error al validar ubicación:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al validar ubicación',
      error: error.message,
    });
  }
};

/**
 * Exportar movimientos a Excel
 * GET /api/movimientos/exportar
 * Query params: mismos filtros que listar
 * Roles: gestor, administrador
 */
export const exportarExcel = async (req: Request, res: Response) => {
  try {
    const {
      busqueda,
      tipo_movimiento,
      estado_movimiento,
      ubicacion_origen,
      ubicacion_destino,
      tienda_origen_id,
      tienda_destino_id,
      fecha_desde,
      fecha_hasta,
      codigo_acta,
    } = req.query;

    const filtros: MovimientoModel.FiltrosMovimiento = {
      busqueda: busqueda as string,
      tipo_movimiento: tipo_movimiento as string,
      estado_movimiento: estado_movimiento as string,
      ubicacion_origen: ubicacion_origen as string,
      ubicacion_destino: ubicacion_destino as string,
      tienda_origen_id: tienda_origen_id ? parseInt(tienda_origen_id as string) : undefined,
      tienda_destino_id: tienda_destino_id ? parseInt(tienda_destino_id as string) : undefined,
      fecha_desde: fecha_desde as string,
      fecha_hasta: fecha_hasta as string,
      codigo_acta: codigo_acta as string,
      ordenar_por: 'em.fecha_salida',
      orden: 'DESC',
    };

    // Obtener movimientos sin paginación
    const movimientos = await MovimientoModel.obtenerMovimientosParaExportar(filtros);

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Inventarios';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Movimientos');

    // Definir columnas
    worksheet.columns = [
      { header: 'CATEGORÍA', key: 'categoria', width: 18 },
      { header: 'SUBCATEGORÍA', key: 'subcategoria', width: 18 },
      { header: 'MARCA', key: 'marca', width: 15 },
      { header: 'MODELO', key: 'modelo', width: 20 },
      { header: 'SERIE', key: 'serie', width: 18 },
      { header: 'INV. ENTEL', key: 'inv_entel', width: 12 },
      { header: 'ORIGEN', key: 'origen', width: 25 },
      { header: 'DESTINO', key: 'destino', width: 25 },
      { header: 'TIPO MOVIMIENTO', key: 'tipo_movimiento', width: 20 },
      { header: 'ESTADO', key: 'estado', width: 15 },
      { header: 'CÓDIGO ACTA', key: 'codigo_acta', width: 15 },
      { header: 'TICKET HELIX', key: 'ticket_helix', width: 12 },
      { header: 'FECHA SALIDA', key: 'fecha_salida', width: 14 },
      { header: 'FECHA LLEGADA', key: 'fecha_llegada', width: 14 },
      { header: 'USUARIO', key: 'usuario', width: 20 },
      { header: 'OBSERVACIONES', key: 'observaciones', width: 30 },
    ];

    // Estilo del header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }, // Indigo
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 25;

    // Mapeo de tipos de movimiento
    const tiposMovimiento: Record<string, string> = {
      INGRESO_ALMACEN: 'Ingreso a Almacén',
      SALIDA_ASIGNACION: 'Asignación',
      SALIDA_REEMPLAZO: 'Reemplazo',
      SALIDA_PRESTAMO: 'Préstamo',
      RETORNO_TIENDA: 'Retorno de Tienda',
      RETORNO_PERSONA: 'Retorno de Persona',
      TRANSFERENCIA_TIENDAS: 'Transferencia',
      CAMBIO_ESTADO: 'Cambio de Estado',
    };

    // Mapeo de estados
    const estadosMovimiento: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_TRANSITO: 'En Tránsito',
      COMPLETADO: 'Completado',
      CANCELADO: 'Cancelado',
    };

    // Función para formatear fecha (solo fecha, sin hora)
    const formatearFecha = (fecha: string | Date | null): string => {
      if (!fecha) return '-';
      const date = new Date(fecha);
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const anio = date.getFullYear();
      return `${dia}/${mes}/${anio}`;
    };

    // Agregar datos
    movimientos.forEach((mov: any) => {
      // Origen directo (sin prefijo)
      let origen = mov.ubicacion_origen;
      if (mov.ubicacion_origen === 'TIENDA' && mov.tienda_origen_nombre) {
        origen = mov.tienda_origen_nombre;
      } else if (mov.ubicacion_origen === 'PERSONA' && mov.persona_origen) {
        origen = mov.persona_origen;
      } else if (mov.ubicacion_origen === 'ALMACEN') {
        origen = 'Almacén';
      }

      // Destino directo (sin prefijo)
      let destino = mov.ubicacion_destino;
      if (mov.ubicacion_destino === 'TIENDA' && mov.tienda_destino_nombre) {
        destino = mov.tienda_destino_nombre;
      } else if (mov.ubicacion_destino === 'PERSONA' && mov.persona_destino) {
        destino = mov.persona_destino;
      } else if (mov.ubicacion_destino === 'ALMACEN') {
        destino = 'Almacén';
      }

      worksheet.addRow({
        categoria: mov.equipo_categoria || '-',
        subcategoria: mov.equipo_subcategoria || '-',
        marca: mov.equipo_marca || '-',
        modelo: mov.equipo_modelo || '-',
        serie: mov.equipo_serie || '-',
        inv_entel: mov.equipo_inv_entel || '-',
        origen,
        destino,
        tipo_movimiento: tiposMovimiento[mov.tipo_movimiento] || mov.tipo_movimiento,
        estado: estadosMovimiento[mov.estado_movimiento] || mov.estado_movimiento,
        codigo_acta: mov.codigo_acta || '-',
        ticket_helix: mov.ticket_helix || '-',
        fecha_salida: formatearFecha(mov.fecha_salida),
        fecha_llegada: formatearFecha(mov.fecha_llegada),
        usuario: mov.usuario_nombre || '-',
        observaciones: mov.observaciones || '-',
      });
    });

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Alternar colores de fila (zebra)
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3F4F6' },
        };
      }
    });

    // Agregar filtros automáticos
    worksheet.autoFilter = {
      from: 'A1',
      to: `P${movimientos.length + 1}`,
    };

    // Generar nombre del archivo
    const fechaExport = new Date().toISOString().slice(0, 10);
    const fileName = `movimientos_${fechaExport}.xlsx`;

    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Escribir al response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Error al exportar movimientos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al exportar movimientos',
      error: error.message,
    });
  }
};

/**
 * Controladores para actualizar y cancelar movimientos
 * Agregar al archivo movimientos.controller.ts existente
 */


/**
 * PUT /api/movimientos/:id
 * Actualizar un movimiento existente
 */
export async function actualizarMovimientoController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      codigo_acta,
      ticket_helix,
      fecha_salida,
      fecha_llegada,
      estado_movimiento,
      motivo,
      observaciones,
    } = req.body;

    // Validaciones básicas
    if (!fecha_salida) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de salida es requerida',
      });
    }

    if (!estado_movimiento || !['PENDIENTE', 'EN_TRANSITO', 'COMPLETADO'].includes(estado_movimiento)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de movimiento inválido',
      });
    }

    const actualizado = await MovimientoModel.actualizarMovimiento(parseInt(id), {
      codigo_acta,
      ticket_helix,
      fecha_salida,
      fecha_llegada,
      estado_movimiento,
      motivo,
      observaciones,
    });

    if (!actualizado) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Movimiento actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el movimiento',
    });
  }
}

/**
 * POST /api/movimientos/:id/cancelar
 * Cancelar un movimiento y revertir el equipo a su ubicación origen
 */
export async function cancelarMovimientoController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const cancelado = await MovimientoModel.cancelarMovimiento(parseInt(id));

    if (!cancelado) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Movimiento cancelado. El equipo fue devuelto a su ubicación origen.',
    });
  } catch (error: any) {
    console.error('Error al cancelar movimiento:', error);
    
    if (error.message === 'El movimiento ya está cancelado') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al cancelar el movimiento',
    });
  }
}


// ============================================
// CONTROLADORES PARA ACCESORIOS
// ============================================

/**
 * GET /api/movimientos/equipos-tienda/:tiendaId/para-instalacion
 */
export const getEquiposParaInstalacion = async (req: Request, res: Response) => {
  try {
    const { tiendaId } = req.params;
    const equipos = await MovimientoModel.obtenerEquiposParaInstalacion(parseInt(tiendaId));
    res.json({ success: true, data: equipos });
  } catch (error) {
    console.error('Error al obtener equipos para instalación:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener equipos' });
  }
};

/**
 * GET /api/movimientos/equipo/:equipoId/accesorios
 */
export const getAccesoriosInstalados = async (req: Request, res: Response) => {
  try {
    const { equipoId } = req.params;
    const accesorios = await MovimientoModel.obtenerAccesoriosInstalados(parseInt(equipoId));
    res.json({ success: true, data: accesorios });
  } catch (error) {
    console.error('Error al obtener accesorios:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener accesorios' });
  }
};

/**
 * POST /api/movimientos/accesorio/:accesorioId/instalar
 */
export const postInstalarAccesorio = async (req: Request, res: Response) => {
  try {
    const { accesorioId } = req.params;
    const { equipo_destino_id, observaciones } = req.body;
    const usuarioId = (req as any).user?.id;

    if (!equipo_destino_id) {
      return res.status(400).json({ success: false, mensaje: 'Se requiere el ID del equipo destino' });
    }

    await MovimientoModel.instalarAccesorio(parseInt(accesorioId), parseInt(equipo_destino_id), usuarioId, observaciones);
    res.json({ success: true, mensaje: 'Accesorio instalado correctamente' });
  } catch (error: any) {
    console.error('Error al instalar accesorio:', error);
    res.status(400).json({ success: false, mensaje: error.message || 'Error al instalar accesorio' });
  }
};

/**
 * POST /api/movimientos/accesorio/:accesorioId/desinstalar
 */
export const postDesinstalarAccesorio = async (req: Request, res: Response) => {
  try {
    const { accesorioId } = req.params;
    const { observaciones } = req.body;
    const usuarioId = (req as any).user?.id;

    await MovimientoModel.desinstalarAccesorio(parseInt(accesorioId), usuarioId, observaciones);
    res.json({ success: true, mensaje: 'Accesorio desinstalado correctamente' });
  } catch (error: any) {
    console.error('Error al desinstalar accesorio:', error);
    res.status(400).json({ success: false, mensaje: error.message || 'Error al desinstalar accesorio' });
  }
};