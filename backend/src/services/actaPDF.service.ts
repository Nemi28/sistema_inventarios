import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { GenerarActaRequest, EquipoEntregado, EquipoRecojo } from '../types/actas.types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class ActaPDFService {
  private static readonly PAGE_WIDTH = 595.28;
  private static readonly PAGE_HEIGHT = 841.89;
  private static readonly MARGIN_TOP = 50;
  private static readonly MARGIN_BOTTOM = 60; // Espacio mínimo antes del footer
  private static readonly MARGIN_LEFT = 45;
  private static readonly MARGIN_RIGHT = 45;

  private static readonly FONT_SIZE = {
    TITLE: 14,
    SUBTITLE: 11,
    NORMAL: 11,
    SMALL: 9,
    TABLE: 7,
  };

  private static readonly COLORS = {
    BLACK: rgb(0, 0, 0),
    BLUE: rgb(0, 0.3, 0.6),
    GRAY: rgb(0.5, 0.5, 0.5),
    LIGHT_GRAY: rgb(0.9, 0.9, 0.9),
    HEADER_BLUE: rgb(0.68, 0.85, 0.9),
  };

  /**
   * Genera el PDF del acta de asignación con soporte para múltiples páginas
   */
  static async generarActaPDF(data: GenerarActaRequest): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    
    // Cargar fuentes
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Crear primera página
    let page = pdfDoc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    let yPosition = this.PAGE_HEIGHT - this.MARGIN_TOP;

    // Obtener nombre del local desde la BD
    const nombreLocal = await this.obtenerNombreLocal(data.local_id);

    // 1. Header (Logo + Código)
    yPosition = await this.dibujarHeader(pdfDoc, page, yPosition);

    // 2. Título principal
    yPosition = this.dibujarTitulo(page, fontBold, yPosition);

    // 3. Tipo de atención (checkboxes)
    yPosition = this.dibujarTipoAtencion(page, font, fontBold, data.tipo_atencion, yPosition);

    // 4. Información del usuario (2 columnas)
    yPosition = this.dibujarInfoUsuario(page, font, fontBold, data, nombreLocal, yPosition);

    // 5. Tabla de equipos entregados (con paginación)
    const resultEntregados = await this.dibujarTablaEquiposConPaginacion(
      pdfDoc,
      page,
      font,
      fontBold,
      'DATOS DEL EQUIPO - ENTREGADO',
      data.equipos_entregados,
      data.observaciones_entregados,
      yPosition,
      false
    );
    page = resultEntregados.page;
    yPosition = resultEntregados.yPosition;

    // 6. Tabla de equipos recojo (condicional, con paginación)
    if (data.tipo_atencion === 'REEMPLAZO' || data.tipo_atencion === 'UPGRADE') {
      if (data.equipos_recojo && data.equipos_recojo.length > 0) {
        const resultRecojo = await this.dibujarTablaEquiposConPaginacion(
          pdfDoc,
          page,
          font,
          fontBold,
          'DATOS DEL EQUIPO - RECOJO DE EQUIPO',
          data.equipos_recojo,
          data.observaciones_recojo,
          yPosition,
          true
        );
        page = resultRecojo.page;
        yPosition = resultRecojo.yPosition;
      }
    }

    // 7. Condiciones y responsabilidades (con paginación)
    const resultCondiciones = await this.dibujarCondicionesConPaginacion(
      pdfDoc,
      page,
      font,
      fontBold,
      yPosition
    );
    page = resultCondiciones.page;
    yPosition = resultCondiciones.yPosition;

    // 8. Firmas (verificar espacio, si no hay, nueva página)
    const espacioFirmas = 120;
    if (yPosition < espacioFirmas + this.MARGIN_BOTTOM) {
      page = pdfDoc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
      yPosition = this.PAGE_HEIGHT - this.MARGIN_TOP;
    }
    this.dibujarFirmas(page, font, fontBold, yPosition);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Crea una nueva página y retorna la posición Y inicial
   */
  private static crearNuevaPagina(pdfDoc: PDFDocument): { page: PDFPage; yPosition: number } {
    const page = pdfDoc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    return { page, yPosition: this.PAGE_HEIGHT - this.MARGIN_TOP };
  }

  /**
   * Verifica si hay espacio suficiente, si no, crea nueva página
   */
  private static verificarEspacio(
    pdfDoc: PDFDocument,
    page: PDFPage,
    yPosition: number,
    espacioRequerido: number
  ): { page: PDFPage; yPosition: number } {
    if (yPosition - espacioRequerido < this.MARGIN_BOTTOM) {
      return this.crearNuevaPagina(pdfDoc);
    }
    return { page, yPosition };
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
      return tiendas.length > 0 ? tiendas[0].nombre_tienda : 'Local no encontrado';
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
    yPosition: number
  ): Promise<number> {
    const logoPath = path.join(__dirname, '../utils/assets/Entel_logo_pe.png');
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    const logoWidth = 120;
    const logoHeight = 40;

    page.drawImage(logoImage, {
      x: this.MARGIN_LEFT,
      y: yPosition - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawRectangle({
      x: this.PAGE_WIDTH - this.MARGIN_RIGHT - 100,
      y: yPosition - logoHeight,
      width: 100,
      height: 30,
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    page.drawText('FORM-26B', {
      x: this.PAGE_WIDTH - this.MARGIN_RIGHT - 85,
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
    yPosition: number
  ): number {
    const titulo = 'FORMATO DE ATENCION DE PETICIONES';
    const tituloWidth = fontBold.widthOfTextAtSize(titulo, this.FONT_SIZE.TITLE);

    page.drawText(titulo, {
      x: (this.PAGE_WIDTH - tituloWidth) / 2,
      y: yPosition,
      size: this.FONT_SIZE.TITLE,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    page.drawLine({
      start: { x: this.MARGIN_LEFT, y: yPosition - 5 },
      end: { x: this.PAGE_WIDTH - this.MARGIN_RIGHT, y: yPosition - 5 },
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
    yPosition: number
  ): number {
    const tipos = ['PRESTAMO', 'REEMPLAZO', 'ASIGNACION', 'UPGRADE'];
    let xPosition = 80;

    tipos.forEach((tipo) => {
      const isSelected = tipo === tipoSeleccionado;

      page.drawRectangle({
        x: xPosition,
        y: yPosition - 12,
        width: 12,
        height: 12,
        borderColor: this.COLORS.BLACK,
        borderWidth: 1,
      });

      if (isSelected) {
        page.drawText('X', {
          x: xPosition + 2,
          y: yPosition - 9,
          size: this.FONT_SIZE.NORMAL,
          font: fontBold,
          color: this.COLORS.BLACK,
        });
      }

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
    yPosition: number
  ): number {
    const leftX = this.MARGIN_LEFT + 5;
    const rightX = this.PAGE_WIDTH / 2 + 20;
    const lineHeight = 20;

    let yPos = yPosition;

    // Columna izquierda
    this.dibujarCampo(page, font, fontBold, 'USUARIO:', data.usuario, leftX, yPos);
    this.dibujarCampo(page, font, fontBold, 'TICKET:', data.ticket, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'EMAIL:', data.email, leftX, yPos);
    this.dibujarCampo(page, font, fontBold, 'AREA:', data.area, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'CARGO:', data.cargo, leftX, yPos);
    this.dibujarCampo(page, font, fontBold, 'FECHA INICIO:', data.fecha_inicio, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'LOCAL:', nombreLocal, leftX, yPos);
    this.dibujarCampo(page, font, fontBold, 'FECHA FIN:', data.fecha_fin, rightX, yPos);
    yPos -= lineHeight;

    this.dibujarCampo(page, font, fontBold, 'JEFE/RESPONSABLE:', data.jefe_responsable, leftX, yPos);
    this.dibujarCampo(page, font, fontBold, 'ING. DE SOP:', data.ing_soporte, rightX, yPos);

    yPos -= 25;

    page.drawLine({
      start: { x: this.MARGIN_LEFT, y: yPos },
      end: { x: this.PAGE_WIDTH - this.MARGIN_RIGHT, y: yPos },
      thickness: 1,
      color: this.COLORS.BLACK,
    });

    return yPos - 15;
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
    page.drawText(label, {
      x: x,
      y: y,
      size: this.FONT_SIZE.SMALL,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    const boxX = x + 100;
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

    page.drawText(valor || '-', {
      x: boxX + 3,
      y: y,
      size: this.FONT_SIZE.SMALL,
      font: font,
      color: this.COLORS.BLACK,
    });
  }

  /**
   * Divide texto en líneas que quepan en el ancho máximo
   */
  private static dividirTextoEnLineas(
    texto: string,
    font: PDFFont,
    fontSize: number,
    maxWidth: number
  ): string[] {
    if (!texto || texto.trim() === '') return ['-'];

    const clean = texto.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return ['-'];

    const lineas: string[] = [];
    const palabras = clean.split(' ');
    let lineaActual = '';

    palabras.forEach((palabra) => {
      if (font.widthOfTextAtSize(palabra, fontSize) > maxWidth) {
        if (lineaActual) {
          lineas.push(lineaActual);
          lineaActual = '';
        }

        let fragmento = '';
        for (let i = 0; i < palabra.length; i++) {
          const prueba = fragmento + palabra[i];
          if (font.widthOfTextAtSize(prueba, fontSize) > maxWidth) {
            if (fragmento) lineas.push(fragmento);
            fragmento = palabra[i];
          } else {
            fragmento = prueba;
          }
        }
        if (fragmento) lineaActual = fragmento;
      } else {
        const prueba = lineaActual + (lineaActual ? ' ' : '') + palabra;
        if (font.widthOfTextAtSize(prueba, fontSize) > maxWidth && lineaActual) {
          lineas.push(lineaActual);
          lineaActual = palabra;
        } else {
          lineaActual = prueba;
        }
      }
    });

    if (lineaActual) lineas.push(lineaActual);
    return lineas.length > 0 ? lineas : ['-'];
  }

  /**
   * Dibuja la tabla de equipos CON soporte para paginación
   */
  private static async dibujarTablaEquiposConPaginacion(
    pdfDoc: PDFDocument,
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    titulo: string,
    equipos: EquipoEntregado[] | EquipoRecojo[],
    observaciones: string | undefined,
    yPosition: number,
    incluirEstado: boolean
  ): Promise<{ page: PDFPage; yPosition: number }> {
    const headers = ['ITEM', 'EQUIPO', 'MARCA', 'MODELO', 'SERIE', 'INVENTARIO', 'HOSTNAME', 'PROC', 'DISCO', 'RAM'];
    if (incluirEstado) headers.push('ESTADO');

    const colWidths = incluirEstado
      ? [22, 40, 36, 58, 63, 47, 63, 40, 48, 34, 55]
      : [25, 45, 40, 65, 70, 52, 68, 45, 52, 38];

    const startX = this.MARGIN_LEFT;
    const minRowHeight = 14;
    const lineHeight = 9;
    const fontSize = this.FONT_SIZE.TABLE;
    const cellPadding = 2;
    const headerHeight = 14;

    // Función para dibujar headers
    const dibujarHeaders = (p: PDFPage, y: number): number => {
      let xPos = startX;
      headers.forEach((header, i) => {
        p.drawRectangle({
          x: xPos,
          y: y - headerHeight,
          width: colWidths[i],
          height: headerHeight,
          color: this.COLORS.HEADER_BLUE,
          borderColor: this.COLORS.BLACK,
          borderWidth: 0.5,
        });

        p.drawText(header, {
          x: xPos + cellPadding,
          y: y - 10,
          size: fontSize,
          font: fontBold,
          color: this.COLORS.BLACK,
        });
        xPos += colWidths[i];
      });
      return y - headerHeight;
    };

    // Verificar espacio para título + headers + al menos una fila
    const espacioMinimo = 60;
    const check = this.verificarEspacio(pdfDoc, page, yPosition, espacioMinimo);
    page = check.page;
    yPosition = check.yPosition;

    // Título de la tabla
    page.drawText(titulo, {
      x: startX,
      y: yPosition,
      size: this.FONT_SIZE.SUBTITLE,
      font: fontBold,
      color: this.COLORS.BLACK,
    });
    yPosition -= 15;

    // Dibujar headers
    yPosition = dibujarHeaders(page, yPosition);

    // Dibujar filas de equipos
    for (let index = 0; index < equipos.length; index++) {
      const equipo = equipos[index];
      
      const row = [
        (index + 1).toString(),
        equipo.equipo || '-',
        equipo.marca || '-',
        equipo.modelo || '-',
        equipo.serie || '-',
        equipo.inventario || '-',
        equipo.hostname || '-',
        equipo.procesador || '-',
        equipo.disco || '-',
        equipo.ram || '-',
      ];

      if (incluirEstado && 'estado' in equipo) {
        row.push((equipo as EquipoRecojo).estado || '-');
      }

      // Calcular líneas para cada celda
      const cellLines: string[][] = [];
      let maxLineas = 1;

      row.forEach((cell, i) => {
        const maxWidth = colWidths[i] - (cellPadding * 2);
        const lineas = this.dividirTextoEnLineas(cell, font, fontSize, maxWidth);
        cellLines.push(lineas);
        maxLineas = Math.max(maxLineas, lineas.length);
      });

      const rowHeight = Math.max(minRowHeight, maxLineas * lineHeight + 4);

      // Verificar si cabe la fila, si no, nueva página con headers
      if (yPosition - rowHeight < this.MARGIN_BOTTOM) {
        const nuevaPagina = this.crearNuevaPagina(pdfDoc);
        page = nuevaPagina.page;
        yPosition = nuevaPagina.yPosition;

        // Título de continuación
        page.drawText(titulo + ' (continuación)', {
          x: startX,
          y: yPosition,
          size: this.FONT_SIZE.SUBTITLE,
          font: fontBold,
          color: this.COLORS.BLACK,
        });
        yPosition -= 15;

        // Redibujar headers
        yPosition = dibujarHeaders(page, yPosition);
      }

      // Dibujar cada celda
      let xPos = startX;
      row.forEach((_, i) => {
        page.drawRectangle({
          x: xPos,
          y: yPosition - rowHeight,
          width: colWidths[i],
          height: rowHeight,
          borderColor: this.COLORS.BLACK,
          borderWidth: 0.5,
        });

        const lineas = cellLines[i];
        let yTexto = yPosition - 9;

        lineas.forEach((linea) => {
          if (yTexto > yPosition - rowHeight + 2) {
            page.drawText(linea, {
              x: xPos + cellPadding,
              y: yTexto,
              size: fontSize,
              font: font,
              color: this.COLORS.BLACK,
            });
            yTexto -= lineHeight;
          }
        });

        xPos += colWidths[i];
      });

      yPosition -= rowHeight;
    }

    // Observaciones
    if (observaciones) {
      const observacionesLimpias = observaciones.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

      if (observacionesLimpias) {
        const espacioObs = 50;
        const checkObs = this.verificarEspacio(pdfDoc, page, yPosition, espacioObs);
        page = checkObs.page;
        yPosition = checkObs.yPosition;

        yPosition -= 8;
        page.drawText('OBSERVACIONES:', {
          x: startX,
          y: yPosition,
          size: this.FONT_SIZE.SMALL,
          font: fontBold,
          color: this.COLORS.BLACK,
        });

        yPosition -= 12;

        const obsWidth = this.PAGE_WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT;
        const obsHeight = 25;

        page.drawRectangle({
          x: startX,
          y: yPosition - obsHeight,
          width: obsWidth,
          height: obsHeight,
          borderColor: this.COLORS.BLACK,
          borderWidth: 0.5,
        });

        const lineasObs = this.dividirTextoEnLineas(
          observacionesLimpias,
          font,
          this.FONT_SIZE.SMALL - 1,
          obsWidth - 10
        );

        let lineY = yPosition - 10;
        lineasObs.forEach((linea) => {
          if (lineY > yPosition - obsHeight + 2) {
            page.drawText(linea, {
              x: startX + 5,
              y: lineY,
              size: this.FONT_SIZE.SMALL - 1,
              font: font,
              color: this.COLORS.BLACK,
            });
            lineY -= 9;
          }
        });

        yPosition -= obsHeight;
      }
    }

    // Línea separadora
    yPosition -= 10;
    page.drawLine({
      start: { x: this.MARGIN_LEFT, y: yPosition },
      end: { x: this.PAGE_WIDTH - this.MARGIN_RIGHT, y: yPosition },
      thickness: 1,
      color: this.COLORS.BLACK,
    });

    return { page, yPosition: yPosition - 15 };
  }

  /**
   * Dibuja las condiciones CON soporte para paginación
   */
  private static async dibujarCondicionesConPaginacion(
    pdfDoc: PDFDocument,
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    yPosition: number
  ): Promise<{ page: PDFPage; yPosition: number }> {
    // Verificar espacio para título
    const checkTitulo = this.verificarEspacio(pdfDoc, page, yPosition, 30);
    page = checkTitulo.page;
    yPosition = checkTitulo.yPosition;

    const titulo = 'Condiciones y responsabilidades sobre la asignación de equipos';
    const tituloWidth = fontBold.widthOfTextAtSize(titulo, this.FONT_SIZE.NORMAL);

    page.drawText(titulo, {
      x: (this.PAGE_WIDTH - tituloWidth) / 2,
      y: yPosition,
      size: this.FONT_SIZE.NORMAL,
      font: fontBold,
      color: this.COLORS.BLACK,
    });

    yPosition -= 18;

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
    const maxWidth = this.PAGE_WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT - 10;

    for (const condicion of condiciones) {
      const startX = this.MARGIN_LEFT + 5 + condicion.indent;
      const condMaxWidth = maxWidth - condicion.indent;
      const lineas = this.dividirTextoEnLineas(condicion.text, font, fontSize, condMaxWidth);
      
      // Calcular espacio necesario para esta condición
      const espacioNecesario = lineas.length * lineSpacing + 5;

      // Verificar espacio
      if (yPosition - espacioNecesario < this.MARGIN_BOTTOM) {
        const nuevaPagina = this.crearNuevaPagina(pdfDoc);
        page = nuevaPagina.page;
        yPosition = nuevaPagina.yPosition;
      }

      // Dibujar cada línea
      lineas.forEach((linea) => {
        page.drawText(linea, {
          x: startX,
          y: yPosition,
          size: fontSize,
          font: font,
          color: this.COLORS.BLACK,
        });
        yPosition -= lineSpacing;
      });

      // Espacio extra después de items numerados
      if (condicion.text.match(/^\d+\./)) {
        yPosition -= 3;
      }
    }

    return { page, yPosition: yPosition - 15 };
  }

  /**
   * Dibuja la sección de firmas al final
   */
  private static dibujarFirmas(
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    yPosition: number
  ): void {
    page.drawLine({
      start: { x: this.MARGIN_LEFT, y: yPosition },
      end: { x: this.PAGE_WIDTH - this.MARGIN_RIGHT, y: yPosition },
      thickness: 1,
      color: this.COLORS.BLACK,
    });

    yPosition -= 25;

    const col1X = this.MARGIN_LEFT;
    const col2X = this.PAGE_WIDTH / 2 + 25;
    const boxWidth = (this.PAGE_WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT - 50) / 2;
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

    page.drawRectangle({
      x: col1X,
      y: yPosition - 20,
      width: boxWidth,
      height: 20,
      color: this.COLORS.LIGHT_GRAY,
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

    page.drawRectangle({
      x: col2X,
      y: yPosition - 20,
      width: boxWidth,
      height: 20,
      color: this.COLORS.LIGHT_GRAY,
      borderColor: this.COLORS.BLACK,
      borderWidth: 1,
    });

    page.drawText('Nombre  /  DNI', {
      x: col2X + boxWidth / 2 - 38,
      y: yPosition - 14,
      size: this.FONT_SIZE.NORMAL,
      font: fontBold,
      color: this.COLORS.BLACK,
    });
  }
}