/**
 * Controlador de Exportación de Equipos
 * Agregar estas funciones al archivo equipos.controller.ts existente
 */

import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { obtenerEquiposParaExportar, FiltrosExportarEquipos } from '../models/equipos.export.model';

// Labels para traducción
const ESTADO_LABELS: Record<string, string> = {
  OPERATIVO: 'Operativo',
  POR_VALIDAR: 'Por Validar',
  EN_GARANTIA: 'En Garantía',
  INOPERATIVO: 'Inoperativo',
  BAJA: 'Baja',
};

const UBICACION_LABELS: Record<string, string> = {
  ALMACEN: 'Almacén',
  TIENDA: 'Tienda',
  PERSONA: 'Persona',
  EN_TRANSITO: 'En Tránsito',
};

const PROPIEDAD_LABELS: Record<string, string> = {
  PROPIO: 'Propio',
  ALQUILADO: 'Alquilado',
};

const TIPO_MOVIMIENTO_LABELS: Record<string, string> = {
  INGRESO_ALMACEN: 'Ingreso Almacén',
  SALIDA_ASIGNACION: 'Asignación',
  SALIDA_REEMPLAZO: 'Reemplazo',
  SALIDA_PRESTAMO: 'Préstamo',
  RETORNO_TIENDA: 'Retorno Tienda',
  RETORNO_PERSONA: 'Retorno Persona',
  TRANSFERENCIA_TIENDAS: 'Transferencia',
  CAMBIO_ESTADO: 'Cambio Estado',
};

/**
 * Exportar equipos a Excel
 * GET /api/equipos/exportar
 */
export async function exportarEquiposExcel(req: Request, res: Response): Promise<void> {
  try {
    const filtros: FiltrosExportarEquipos = {
      ubicacion: req.query.ubicacion as any,
      estado: req.query.estado as any,
      categoria_id: req.query.categoria_id ? Number(req.query.categoria_id) : undefined,
      subcategoria_id: req.query.subcategoria_id ? Number(req.query.subcategoria_id) : undefined,
      marca_id: req.query.marca_id ? Number(req.query.marca_id) : undefined,
      modelo_id: req.query.modelo_id ? Number(req.query.modelo_id) : undefined,
      tienda_id: req.query.tienda_id ? Number(req.query.tienda_id) : undefined,
      busqueda: req.query.busqueda as string,
    };

    const equipos = await obtenerEquiposParaExportar(filtros);

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Inventarios';
    workbook.created = new Date();

    // Determinar nombre de la hoja según filtro
    let sheetName = 'Equipos';
    let fileName = 'equipos';
    
    if (filtros.ubicacion === 'ALMACEN') {
      sheetName = 'Equipos en Almacén';
      fileName = 'equipos_almacen';
    } else if (filtros.ubicacion === 'TIENDA') {
      sheetName = 'Equipos en Tiendas';
      fileName = 'equipos_tiendas';
    } else if (filtros.ubicacion === 'PERSONA') {
      sheetName = 'Equipos en Personas';
      fileName = 'equipos_personas';
    }

    const worksheet = workbook.addWorksheet(sheetName);

    // Definir columnas según ubicación
    if (filtros.ubicacion === 'ALMACEN') {
      // Columnas para Almacén (sin datos de tienda)
      worksheet.columns = [
        { header: 'CATEGORÍA', key: 'categoria', width: 15 },
        { header: 'SUBCATEGORÍA', key: 'subcategoria', width: 18 },
        { header: 'MARCA', key: 'marca', width: 15 },
        { header: 'MODELO', key: 'modelo', width: 25 },
        { header: 'SERIE', key: 'numero_serie', width: 20 },
        { header: 'INV. ENTEL', key: 'inv_entel', width: 15 },
        { header: 'ESTADO', key: 'estado', width: 14 },
        { header: 'PROPIEDAD', key: 'propiedad', width: 12 },
        { header: 'GARANTÍA', key: 'garantia', width: 10 },
        { header: 'PROCEDENCIA', key: 'procedencia', width: 25 },
        { header: 'ORDEN COMPRA', key: 'orden_compra', width: 15 },
        { header: 'FECHA COMPRA', key: 'fecha_compra', width: 14 },
        { header: 'OBSERVACIONES', key: 'observaciones', width: 30 },
        { header: 'DISCO SSD', key: 'disco_ssd', width: 20 },
        { header: 'MEMORIA RAM', key: 'memoria_ram', width: 25 },
      ];
    } else if (filtros.ubicacion === 'TIENDA') {
      // Columnas para Tiendas (con datos de tienda)
      worksheet.columns = [
        { header: 'PDV', key: 'tienda_pdv', width: 10 },
        { header: 'TIPO LOCAL', key: 'tipo_local', width: 12 },
        { header: 'PERFIL DE LOCAL', key: 'perfil_local', width: 14 },
        { header: 'NOMBRE TIENDA', key: 'nombre_tienda', width: 25 },
        { header: 'SOCIO', key: 'socio', width: 25 },
        { header: 'CATEGORÍA', key: 'categoria', width: 15 },
        { header: 'SUBCATEGORÍA', key: 'subcategoria', width: 18 },
        { header: 'MARCA', key: 'marca', width: 15 },
        { header: 'MODELO', key: 'modelo', width: 25 },
        { header: 'SERIE', key: 'numero_serie', width: 20 },
        { header: 'INV ENTEL', key: 'inv_entel', width: 15 },
        { header: 'HOSTNAME', key: 'hostname', width: 18 },
        { header: 'POSICIÓN', key: 'posicion_tienda', width: 12 },
        { header: 'ÁREA', key: 'area_tienda', width: 15 },
        { header: 'RESPONSABLE SOCIO', key: 'responsable_socio', width: 22 },
        { header: 'RESPONSABLE ENTEL', key: 'responsable_entel', width: 22 },
        { header: 'PROPIEDAD', key: 'propiedad', width: 12 },
        { header: 'SISTEMA OPERATIVO', key: 'sistema_operativo', width: 18 },
        { header: 'DISCO SSD', key: 'disco_ssd', width: 20 },
        { header: 'MEMORIA RAM', key: 'memoria_ram', width: 25 },
      ];
    } else if (filtros.ubicacion === 'PERSONA') {
      // Columnas para Personas
      worksheet.columns = [
        { header: 'CATEGORÍA', key: 'categoria', width: 15 },
        { header: 'SUBCATEGORÍA', key: 'subcategoria', width: 18 },
        { header: 'MARCA', key: 'marca', width: 15 },
        { header: 'MODELO', key: 'modelo', width: 25 },
        { header: 'SERIE', key: 'numero_serie', width: 20 },
        { header: 'INV ENTEL', key: 'inv_entel', width: 15 },
        { header: 'PERSONA', key: 'persona_asignada', width: 25 },
        { header: 'ACTA', key: 'codigo_acta', width: 15 },
        { header: 'FECHA DE ASIGNACIÓN', key: 'fecha_asignacion', width: 20 },
        { header: 'TIPO MOVIMIENTO', key: 'tipo_movimiento', width: 18 },
        { header: 'PROPIEDAD', key: 'propiedad', width: 12 },
        { header: 'ESTADO', key: 'estado', width: 14 },
        { header: 'OBSERVACIONES', key: 'observaciones', width: 30 },
        { header: 'DISCO SSD', key: 'disco_ssd', width: 20 },
        { header: 'MEMORIA RAM', key: 'memoria_ram', width: 25 },
      ];
    } else {
      // Columnas generales (todos los equipos)
      worksheet.columns = [
        { header: 'CATEGORÍA', key: 'categoria', width: 15 },
        { header: 'SUBCATEGORÍA', key: 'subcategoria', width: 18 },
        { header: 'MARCA', key: 'marca', width: 15 },
        { header: 'MODELO', key: 'modelo', width: 25 },
        { header: 'SERIE', key: 'numero_serie', width: 20 },
        { header: 'INV. ENTEL', key: 'inv_entel', width: 15 },
        { header: 'UBICACIÓN', key: 'ubicacion', width: 14 },
        { header: 'PDV', key: 'tienda_pdv', width: 10 },
        { header: 'TIENDA', key: 'nombre_tienda', width: 25 },
        { header: 'SOCIO', key: 'socio', width: 25 },
        { header: 'ESTADO', key: 'estado', width: 14 },
        { header: 'PROPIEDAD', key: 'propiedad', width: 12 },
        { header: 'OBSERVACIONES', key: 'observaciones', width: 30 },
        { header: 'DISCO SSD', key: 'disco_ssd', width: 20 },
        { header: 'MEMORIA RAM', key: 'memoria_ram', width: 25 },
      ];
    }

    // Estilo del header
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }, // Indigo
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11,
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Agregar datos
    equipos.forEach((equipo, index) => {
      const rowData: any = {
        categoria: equipo.categoria,
        subcategoria: equipo.subcategoria,
        marca: equipo.marca,
        modelo: equipo.modelo,
        numero_serie: equipo.numero_serie || 'ILEGIBLE',
        inv_entel: equipo.inv_entel || '-',
        estado: ESTADO_LABELS[equipo.estado_actual] || equipo.estado_actual,
        ubicacion: UBICACION_LABELS[equipo.ubicacion_actual] || equipo.ubicacion_actual,
        propiedad: PROPIEDAD_LABELS[equipo.tipo_propiedad] || equipo.tipo_propiedad,
        garantia: equipo.garantia ? 'Sí' : 'No',
        procedencia: equipo.procedencia || 'Ingreso directo',
        tienda_pdv: equipo.tienda_pdv || '-',
        tipo_local: equipo.tipo_local || '-',
        perfil_local: equipo.perfil_local || '-',
        nombre_tienda: equipo.nombre_tienda || '-',
        socio: equipo.socio || '-',
        hostname: equipo.hostname || '-',
        posicion_tienda: equipo.posicion_tienda || '-',
        area_tienda: equipo.area_tienda || '-',
        responsable_socio: equipo.responsable_socio || '-',
        responsable_entel: equipo.responsable_entel || '-',
        sistema_operativo: equipo.sistema_operativo || '-',
        orden_compra: equipo.orden_compra || '-',
        fecha_compra: equipo.fecha_compra 
          ? new Date(equipo.fecha_compra).toLocaleDateString('es-PE') 
          : '-',
        observaciones: equipo.observaciones || '-',
        // Campos para Personas
        persona_asignada: equipo.persona_asignada || '-',
        codigo_acta: equipo.codigo_acta || '-',
        fecha_asignacion: equipo.fecha_asignacion 
          ? new Date(equipo.fecha_asignacion).toLocaleDateString('es-PE') 
          : '-',
        tipo_movimiento: TIPO_MOVIMIENTO_LABELS[equipo.tipo_movimiento_persona] || equipo.tipo_movimiento_persona || '-',
        disco_ssd: equipo.disco_ssd || '-',
        memoria_ram: equipo.memoria_ram || '-',
      };

      const row = worksheet.addRow(rowData);

      // Estilo zebra
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' },
          };
        });
      }

      // Bordes
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Habilitar filtros
    worksheet.autoFilter = {
      from: 'A1',
      to: `${String.fromCharCode(64 + worksheet.columns.length)}1`,
    };

    // Configurar respuesta
    const fecha = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${fecha}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fullFileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar equipos',
    });
  }
}