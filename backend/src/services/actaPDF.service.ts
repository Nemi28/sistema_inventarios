import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { GenerarActaRequest, EquipoEntregado, EquipoRecojo } from '../types/actas.types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class ActaPDFService {
  private static readonly FONT_SIZE = {
    TITLE: 14,
    SUBTITLE: 10,
    NORMAL: 10,
    SMALL: 8,
  };

  private static readonly COLORS = {
    BLACK: rgb(0, 0, 0),
    BLUE: rgb(0, 0.3, 0.6),
    GRAY: rgb(0.5, 0.5, 0.5),
    LIGHT_GRAY: rgb(0.9, 0.9, 0.9),
  };

  /**
   * Genera el PDF del acta de asignación
   */
  static async generarActaPDF(data: GenerarActaRequest): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Cargar fuentes
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Obtener nombre del local desde la BD
    const nombreLocal = await this.obtenerNombreLocal(data.local_id);

    let yPosition = height - 50;

    // 1. Header (Logo + Código)
    yPosition = await this.dibujarHeader(pdfDoc, page, yPosition, width);

    // 2. Título principal
    yPosition = this.dibujarTitulo(page, fontBold, yPosition, width);

    // 3. Tipo de atención (checkboxes)
    yPosition = this.dibujarTipoAtencion(page, font, fontBold, data.tipo_atencion, yPosition, width);

    // 4. Información del usuario (2 columnas)
    yPosition = this.dibujarInfoUsuario(page, font, fontBold, data, nombreLocal, yPosition, width);

    // 5. Tabla de equipos entregados
    yPosition = await this.dibujarTablaEquipos(
      page,
      font,
      fontBold,
      'DATOS DEL EQUIPO - ENTREGADO',
      data.equipos_entregados,
      data.observaciones_entregados,
      yPosition,
      width,
      false
    );

    // 6. Tabla de equipos recojo (condicional)
    if (data.tipo_atencion === 'REEMPLAZO' || data.tipo_atencion === 'UPGRADE') {
      if (data.equipos_recojo && data.equipos_recojo.length > 0) {
        yPosition = await this.dibujarTablaEquipos(
          page,
          font,
          fontBold,
          'DATOS DEL EQUIPO - RECOJO DE EQUIPO',
          data.equipos_recojo,
          data.observaciones_recojo,
          yPosition,
          width,
          true
        );
      }
    }

    // 7. Condiciones y responsabilidades
    yPosition = await this.dibujarCondiciones(pdfDoc, page, font, fontBold, yPosition);

    // 8. Firmas
    this.dibujarFirmas(page, font, fontBold, yPosition, width);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Obtiene el nombre del local desde la BD
   */
  private static async obtenerNombreLocal(localId: number): Promise<string> {
    try {
      const [tiendas] = await pool.query<RowDataPacket[]>(
        'SELECT nombre_tienda FROM tienda WHERE id = ?',
        [localId]
      );

      if (tiendas.length > 0) {
        return tiendas[0].nombre_tienda;
      }
      return 'Local no encontrado';
    } catch (error) {
      console.error('Error al obtener nombre del local:', error);
      return 'Error al cargar local';
    }
  }

  /**
   * Dibuja el header con logo y código
   */
  private static async dibujarHeader(
    pdfDoc: PDFDocument,
    page: PDFPage,
    yPosition: number,
    width: number
  ): Promise<number> {
    // Cargar logo
    const logoPath = path.join(__dirname, '../utils/assets/Entel_logo_pe.png');
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    const logoWidth = 120;
    const logoHeight = 40;

    // Dibujar logo (izquierda)
    page.drawImage(logoImage, {
      x: 50,
      y: yPosition - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });

    // Dibujar código "FORM-26B" (derecha)
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawRectangle({
      x: width - 150,
      y: yPosition - logoHeight,
      width: 100,
      height: 30,
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    page.drawText('FORM-26B', {
      x: width - 135,
      y: yPosition - logoHeight + 10,
      size: this.FONT_SIZE.SUBTITLE,
      font: font,
      color: this.COLORS.BLACK,
    });

    return yPosition - logoHeight - 30;
  }

  /**
   * Dibuja el título principal
   */
  private static dibujarTitulo(
    page: PDFPage,
    fontBold: PDFFont,
    yPosition: number,
    width: number
  ): number {
    const titulo = 'FORMATO DE ATENCION DE PETICIONES';
    const tituloWidth = fontBold.widthOfTextAtSize(titulo, this.FONT_SIZE.TITLE);

    page.drawText(titulo, {
      x: (width - tituloWidth) / 2,
      y: yPosition,
      size: this.FONT_SIZE.TITLE,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    // Línea separadora
    page.drawLine({
      start: { x: 50, y: yPosition - 5 },
      end: { x: width - 50, y: yPosition - 5 },
      thickness: 1,
      color: this.COLORS.BLACK,
    });

    return yPosition - 35;
  }

  /**
   * Dibuja los checkboxes de tipo de atención
   */
  private static dibujarTipoAtencion(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    tipoSeleccionado: string,
    yPosition: number,
    width: number
  ): number {
    const tipos = ['PRESTAMO', 'REEMPLAZO', 'ASIGNACION', 'UPGRADE'];
    const startX = 80;
    let xPosition = startX;

    tipos.forEach((tipo) => {
      const isSelected = tipo === tipoSeleccionado;

      // Dibujar checkbox
      page.drawRectangle({
        x: xPosition,
        y: yPosition - 12,
        width: 12,
        height: 12,
        borderColor: this.COLORS.BLACK,
        borderWidth: 1,
      });

      // Si está seleccionado, dibujar X
      if (isSelected) {
        page.drawText('X', {
          x: xPosition + 2,
          y: yPosition - 9,
          size: this.FONT_SIZE.NORMAL,
          font: fontBold,
          color: this.COLORS.BLACK,
        });
      }

      // Dibujar label
      page.drawText(tipo + ':', {
        x: xPosition + 18,
        y: yPosition - 9,
        size: this.FONT_SIZE.SMALL,
        font: font,
        color: this.COLORS.BLACK,
      });

      xPosition += 120;
    });

    return yPosition - 35;
  }

  /**
   * Dibuja la información del usuario en 2 columnas
   */
  private static dibujarInfoUsuario(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    data: GenerarActaRequest,
    nombreLocal: string,
    yPosition: number,
    width: number
  ): number {
    const leftX = 50;
    const rightX = width / 2 + 20;
    const lineHeight = 20;

    // Columna izquierda
    let yPos = yPosition;

    this.dibujarCampo(page, font, fontBold, 'USUARIO:', data.usuario, leftX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'EMAIL:', data.email, leftX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'CARGO:', data.cargo, leftX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'LOCAL:', nombreLocal, leftX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'JEFE/RESPONSABLE:', data.jefe_responsable, leftX, yPos);

    // Columna derecha
    yPos = yPosition;

    this.dibujarCampo(page, font, fontBold, 'TICKET:', data.ticket, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'AREA:', data.area, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'FECHA INICIO:', data.fecha_inicio, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'FECHA FIN:', data.fecha_fin, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'ING. DE SOP:', data.ing_soporte, rightX, yPos);

    // Línea separadora
    page.drawLine({
      start: { x: 50, y: yPosition - (lineHeight * 5) - 25 },
      end: { x: width - 50, y: yPosition - (lineHeight * 5) - 25 },
      thickness: 1,
      color: this.COLORS.BLACK,
    });

    return yPosition - (lineHeight * 5) - 35;
  }

  /**
   * Dibuja un campo (label + valor) con recuadro
   */
  private static dibujarCampo(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    label: string,
    valor: string,
    x: number,
    y: number
  ): void {
    // Dibujar label
    page.drawText(label, {
      x: x,
      y: y,
      size: this.FONT_SIZE.SMALL,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    // Dibujar recuadro para el valor
    const boxX = x + 110;
    const boxWidth = 150;
    const boxHeight = 16;

    page.drawRectangle({
      x: boxX,
      y: y - 4,
      width: boxWidth,
      height: boxHeight,
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    // Dibujar valor dentro del recuadro
    page.drawText(valor, {
      x: boxX + 3,
      y: y,
      size: this.FONT_SIZE.SMALL,
      font: font,
      color: this.COLORS.BLACK,
    });
  }

  /**
   * Dibuja la tabla de equipos (entregados o recojo)
   */
  private static async dibujarTablaEquipos(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    titulo: string,
    equipos: EquipoEntregado[] | EquipoRecojo[],
    observaciones: string | undefined,
    yPosition: number,
    width: number,
    incluirEstado: boolean
  ): Promise<number> {
    // Título de la tabla
    page.drawText(titulo, {
      x: 50,
      y: yPosition,
      size: this.FONT_SIZE.SUBTITLE,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    yPosition -= 15;

    // Headers de la tabla
    const headers = ['ITEM', 'EQUIPO', 'MARCA', 'MODELO', 'SERIE', 'INVENTARIO', 'HOSTNAME', 'PROC', 'DISCO', 'RAM'];
    if (incluirEstado) {
      headers.push('ESTADO');
    }

    // Anchos optimizados para mostrar todo el contenido
    const colWidths = incluirEstado 
      ? [20, 38, 35, 60, 65, 45, 65, 38, 48, 32, 60]  // Con estado
      : [25, 42, 38, 70, 75, 50, 70, 42, 52, 36];     // Sin estado

    const startX = 45;
    const rowHeight = 12;

    // Dibujar headers con fondo azul claro y bordes
    let xPos = startX;
    headers.forEach((header, i) => {
      // Dibujar fondo azul claro para header
      page.drawRectangle({
        x: xPos,
        y: yPosition - rowHeight,
        width: colWidths[i],
        height: rowHeight,
        color: rgb(0.68, 0.85, 0.9), // Azul claro
        borderColor: this.COLORS.BLACK,
        borderWidth: 0.5,
      });

      // Dibujar texto del header
      page.drawText(header, {
        x: xPos + 2,
        y: yPosition - 9,
        size: this.FONT_SIZE.SMALL - 1,
        font: fontBold,
        color: this.COLORS.BLACK,
      });
      xPos += colWidths[i];
    });

    yPosition -= rowHeight;

    // Dibujar filas de equipos con bordes
    equipos.forEach((equipo, index) => {
      xPos = startX;

      const row = [
        (index + 1).toString(),
        equipo.equipo,
        equipo.marca,
        equipo.modelo,
        equipo.serie,
        equipo.inventario,
        equipo.hostname || '-',
        equipo.procesador || '-',
        equipo.disco || '-',
        equipo.ram || '-',
      ];

      if (incluirEstado && 'estado' in equipo) {
        const equipoRecojo = equipo as EquipoRecojo;
        row.push(equipoRecojo.estado);
      }

      row.forEach((cell, i) => {
        // Dibujar borde de celda
        page.drawRectangle({
          x: xPos,
          y: yPosition - rowHeight,
          width: colWidths[i],
          height: rowHeight,
          borderColor: this.COLORS.BLACK,
          borderWidth: 0.5,
        });

        // Ajustar texto si es muy largo para que quepa en la celda
        let displayText = cell;
        const fontSize = this.FONT_SIZE.SMALL - 2;
        const maxWidth = colWidths[i] - 4;
        let textWidth = font.widthOfTextAtSize(displayText, fontSize);
        
        // Si el texto es muy largo, reducir hasta que quepa
        while (textWidth > maxWidth && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
          textWidth = font.widthOfTextAtSize(displayText + '.', fontSize);
        }
        
        if (displayText !== cell && displayText.length > 0) {
          displayText = displayText + '.';
        }

        // Dibujar texto
        page.drawText(displayText, {
          x: xPos + 2,
          y: yPosition - 9,
          size: fontSize,
          font: font,
          color: this.COLORS.BLACK,
        });
        xPos += colWidths[i];
      });

      yPosition -= rowHeight;
    });

    // Observaciones con borde
    if (observaciones) {
      yPosition -= 8;
      page.drawText('OBSERVACIONES:', {
        x: 50,
        y: yPosition,
        size: this.FONT_SIZE.SMALL,
        font: fontBold,
        color: this.COLORS.BLACK,
      });

      yPosition -= 12;
      
      // Recuadro para observaciones
      const obsWidth = width - 100;
      const obsHeight = 25;
      
      page.drawRectangle({
        x: 50,
        y: yPosition - obsHeight,
        width: obsWidth,
        height: obsHeight,
        borderColor: this.COLORS.BLACK,
        borderWidth: 0.5,
      });

      // Texto de observaciones
      const words = observaciones.split(' ');
      let currentLine = '';
      let lineY = yPosition - 10;
      const maxLineWidth = obsWidth - 10;

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const lineWidth = font.widthOfTextAtSize(testLine, this.FONT_SIZE.SMALL - 2);

        if (lineWidth > maxLineWidth && currentLine) {
          page.drawText(currentLine, {
            x: 55,
            y: lineY,
            size: this.FONT_SIZE.SMALL - 2,
            font: font,
            color: this.COLORS.BLACK,
          });
          lineY -= 8;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      // Dibujar última línea
      if (currentLine) {
        page.drawText(currentLine, {
          x: 55,
          y: lineY,
          size: this.FONT_SIZE.SMALL - 2,
          font: font,
          color: this.COLORS.BLACK,
        });
      }

      yPosition -= obsHeight;
    }

    // Línea separadora
    page.drawLine({
      start: { x: 50, y: yPosition - 10 },
      end: { x: width - 50, y: yPosition - 10 },
      thickness: 1,
      color: this.COLORS.BLACK,
    });

    return yPosition - 25;
  }

  /**
   * Dibuja las condiciones y responsabilidades
   */
  private static async dibujarCondiciones(
    pdfDoc: PDFDocument,
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    yPosition: number
  ): Promise<number> {
    // Si el espacio no es suficiente, crear nueva página
    if (yPosition < 250) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = page.getSize().height - 50;
    }

    // Título centrado
    const titulo = 'Condiciones y responsabilidades sobre la asignación de equipos';
    const tituloWidth = fontBold.widthOfTextAtSize(titulo, this.FONT_SIZE.NORMAL);
    const pageWidth = page.getSize().width;

    page.drawText(titulo, {
      x: (pageWidth - tituloWidth) / 2,
      y: yPosition,
      size: this.FONT_SIZE.NORMAL,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    yPosition -= 18;

    // Condiciones
    const condiciones = [
      { text: '1. El empleado recibe el equipo asignado, por tiempo indefinido para uso exclusivo en actividades relacionadas a su trabajo para Entel.', indent: 0 },
      { text: '2. Es responsabilidad del empleado mantener las condiciones de seguridad adecuadas para no exponer el equipo a robo o daños, dentro y fuera de las instalaciones de Entel.', indent: 0 },
      { text: '3. En el caso de laptops y netbooks que cuenten con la ranura de seguridad (kensington lock) el equipo será entregado con la cadena de seguridad, el mismo que debe ser usado permanentemente por el usuario.', indent: 0 },
      { text: '4. Cuando el equipo requiera ser transportado, especialmente fuera de las instalaciones de Entel evitar llevarlo a la vista del público y cautelar que el transporte sea por el menor tiempo posible.', indent: 0 },
      { text: '5. En caso de pérdida o robo del equipo:', indent: 0 },
      { text: 'a. El usuario debe realizar una denuncia policial inmediatamente de sucedido el hecho.', indent: 15 },
      { text: 'b. Presentar un informe detallado de los hechos, a su Gerente y al Gerente de Seguridad Entel dentro de las 24 horas siguientes de sucedido el hecho.', indent: 15 },
      { text: 'c. Tan pronto tenga copia de la denuncia debe enviar por e-mail imagen de la denuncia policial al Gerente de Seguridad, con copia a su propio gerente.', indent: 15 },
      { text: 'd. El área de Seguridad evaluará cada caso para determinar si hubo responsabilidad o negligencia por parte del usuario.', indent: 15 },
      { text: '6. Es responsabilidad del empleado leer la Política de Asignación de Equipos Informáticos portátiles designado por la Vicepresidencia de TI & Procesos.', indent: 0 },
      { text: '7. Mayor información remitirse a la Política de Asignación de Equipos Informáticos.', indent: 0 },
    ];

    const lineSpacing = 10;
    const fontSize = this.FONT_SIZE.SMALL - 1;

    condiciones.forEach((condicion) => {
      const words = condicion.text.split(' ');
      let currentLine = '';
      const startX = 50 + condicion.indent;
      const maxWidth = 495 - condicion.indent;

      words.forEach((word, index) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (lineWidth > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: startX,
            y: yPosition,
            size: fontSize,
            font: font,
            color: this.COLORS.BLACK,
          });
          yPosition -= lineSpacing;
          currentLine = word;
        } else {
          currentLine = testLine;
        }

        if (index === words.length - 1 && currentLine) {
          page.drawText(currentLine, {
            x: startX,
            y: yPosition,
            size: fontSize,
            font: font,
            color: this.COLORS.BLACK,
          });
          yPosition -= lineSpacing;
        }
      });

      if (condicion.text.match(/^\d+\./)) {
        yPosition -= 3;
      }
    });

    yPosition -= 15;
    return yPosition;
  }

  /**
   * Dibuja la sección de firmas al final
   */
  private static dibujarFirmas(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    yPosition: number,
    width: number
  ): void {
    // Línea separadora
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: this.COLORS.BLACK,
    });

    yPosition -= 25;

    // Dos columnas para firmas
    const col1X = 50;
    const col2X = width / 2 + 25;
    const boxWidth = (width - 150) / 2;
    const boxHeight = 60;

    // Firma Usuario Entel
    page.drawRectangle({
      x: col1X,
      y: yPosition - boxHeight,
      width: boxWidth,
      height: boxHeight,
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    // Header de la firma
    page.drawRectangle({
      x: col1X,
      y: yPosition - 20,
      width: boxWidth,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    page.drawText('Firma Usuario Entel', {
      x: col1X + boxWidth / 2 - 45,
      y: yPosition - 14,
      size: this.FONT_SIZE.NORMAL,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    // Usuario / DNI
    page.drawRectangle({
      x: col2X,
      y: yPosition - boxHeight,
      width: boxWidth,
      height: boxHeight,
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    // Header Usuario / DNI
    page.drawRectangle({
      x: col2X,
      y: yPosition - 20,
      width: boxWidth,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    page.drawText('Usuario  /  DNI', {
      x: col2X + boxWidth / 2 - 38,
      y: yPosition - 14,
      size: this.FONT_SIZE.NORMAL,
      font: fontBold,
      color: this.COLORS.BLACK,
    });
  }
}