import { Request, Response } from 'express';
import { ActaPDFService } from '../services/actaPDF.service';
import { GenerarActaRequest } from '../types/actas.types';

export class ActasController {
  /**
   * Genera el PDF del acta de asignación
   * POST /api/actas/generar-pdf
   */
  static async generarPDF(req: Request, res: Response): Promise<void> {
    try {
      const data: GenerarActaRequest = req.body;

      // Validaciones básicas
      if (!data.ticket || !data.usuario || !data.email) {
        res.status(400).json({
          success: false,
          mensaje: 'Faltan campos requeridos',
        });
        return;
      }

      if (!data.equipos_entregados || data.equipos_entregados.length === 0) {
        res.status(400).json({
          success: false,
          mensaje: 'Debe haber al menos un equipo entregado',
        });
        return;
      }

      // Validar que si es REEMPLAZO o UPGRADE, haya equipos de recojo
      if (
        (data.tipo_atencion === 'REEMPLAZO' || data.tipo_atencion === 'UPGRADE') &&
        (!data.equipos_recojo || data.equipos_recojo.length === 0)
      ) {
        res.status(400).json({
          success: false,
          mensaje: 'Para REEMPLAZO o UPGRADE debe haber al menos un equipo de recojo',
        });
        return;
      }

      // Generar PDF
      const pdfBuffer = await ActaPDFService.generarActaPDF(data);

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${data.ticket}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      // Enviar PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error al generar el PDF',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
}