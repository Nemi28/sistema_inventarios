import ExcelJS from 'exceljs';
import {
  GuiaRequestDTO,
  TiendaData,
  SKUData,
  CabeceraExcel,
  DetalleExcel,
} from '../types/guias.types';
import {
  DATOS_MOCK,
  DIRECCIONES_MOCK,
  COLORES_EXCEL,
  COLUMNAS_CABECERA,
  COLUMNAS_DETALLE,
  COLUMNAS_EDITABLES,
  ANCHOS_COLUMNAS,
} from '../utils/constants';

export class ExcelGeneratorService {
  /**
   * Genera el archivo Excel completo con Cabecera y Detalle
   */
  static async generarExcel(
    data: GuiaRequestDTO,
    tienda: TiendaData,
    skus: SKUData[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Configurar propiedades del libro
    workbook.creator = 'Sistema de Inventarios';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Crear hojas
    const wsCabecera = workbook.addWorksheet('Cabecera');
    const wsDetalle = workbook.addWorksheet('Detalle');

    // Generar contenido
    this.crearHojaCabecera(wsCabecera, data, tienda);
    this.crearHojaDetalle(wsDetalle, data, skus);

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Crea la hoja "Cabecera" con 21 columnas
   */
  private static crearHojaCabecera(
    worksheet: ExcelJS.Worksheet,
    data: GuiaRequestDTO,
    tienda: TiendaData
  ): void {
    // 1. Agregar headers (fila 1)
    worksheet.addRow(COLUMNAS_CABECERA);

    // 2. Estilizar headers
    this.estilizarHeaders(worksheet.getRow(1));

    // 3. Construir valores de la fila 2
    const valores = this.construirValoresCabecera(data, tienda);

    // 4. Agregar fila de datos
    worksheet.addRow(valores);

    // 5. Aplicar protección y colores a celdas
    this.aplicarProteccionCabecera(worksheet, data.tipo);

    // 6. Ajustar anchos de columnas
    worksheet.columns.forEach((col) => {
      col.width = ANCHOS_COLUMNAS.cabecera;
    });
  }

  /**
   * Construye los valores de la fila de datos de Cabecera
   */
  private static construirValoresCabecera(
    data: GuiaRequestDTO,
    tienda: TiendaData
  ): any[] {
    const esEnvio = data.tipo === 'envio';

    const cabecera: CabeceraExcel = {
      // Datos fijos (siempre iguales)
      GRE_ID: 1, // Auto-incremental en caso de guardar en BD
      TipoDocRemit: DATOS_MOCK.remitente.tipo_doc,
      NroRucRemitente: DATOS_MOCK.remitente.ruc,
      RazonSocialRemitente: DATOS_MOCK.remitente.razon_social,
      TipoDocDest: DATOS_MOCK.remitente.tipo_doc,
      TipoDocTransp: DATOS_MOCK.transportista.tipo_doc,
      NroRucTransportista: DATOS_MOCK.transportista.ruc,
      RazonSocialTransportista: DATOS_MOCK.transportista.razon_social,
      PuntoEmision: DATOS_MOCK.punto_emision,

      // Datos según tipo de guía
      MotivoTraslado: esEnvio
        ? DATOS_MOCK.motivo_traslado.envio
        : DATOS_MOCK.motivo_traslado.recojo,
      DescripcionMotivoTraslado: esEnvio
        ? DATOS_MOCK.descripcion_motivo.envio
        : DATOS_MOCK.descripcion_motivo.recojo,

      // Datos del formulario
      FechaInicioTraslado: data.fecha_inicio_traslado,
      NroOrden: data.nro_orden,
      Observacion: data.observacion || '',

      // Datos según tipo: ENVÍO
      ...(esEnvio
        ? {
            // Destino = Datos FIJOS (ENTEL PERU)
            NroRucDestinatario: DATOS_MOCK.remitente.ruc,
            RazonSocialDestinatario: DATOS_MOCK.remitente.razon_social,
            NroRucPuntoLlegada: DATOS_MOCK.remitente.ruc,
            DireccionPuntoLlegada: tienda.direccion,

            // Origen = Datos MOCK fijos
            CodUbigeoPartida: DIRECCIONES_MOCK.origen_fijo.ubigeo,
            NroRucPuntoPartida: DIRECCIONES_MOCK.origen_fijo.ruc,
            DireccionPuntoPartida: DIRECCIONES_MOCK.origen_fijo.direccion,
          }
        : {
            // Datos según tipo: RECOJO
            // Origen = Tienda seleccionada
            CodUbigeoPartida: tienda.ubigeo,
            NroRucPuntoPartida: tienda.socio_ruc,
            DireccionPuntoPartida: tienda.direccion,

            // Destino = Datos MOCK fijos
            NroRucDestinatario: DIRECCIONES_MOCK.destino_fijo.ruc,
            RazonSocialDestinatario:
              DIRECCIONES_MOCK.destino_fijo.razon_social,
            NroRucPuntoLlegada: DIRECCIONES_MOCK.destino_fijo.ruc,
            DireccionPuntoLlegada: DIRECCIONES_MOCK.destino_fijo.direccion,
          }),
    };

    // Retornar en el orden de las columnas
    return [
      cabecera.GRE_ID,
      cabecera.TipoDocRemit,
      cabecera.NroRucRemitente,
      cabecera.RazonSocialRemitente,
      cabecera.TipoDocDest,
      cabecera.NroRucDestinatario,
      cabecera.RazonSocialDestinatario,
      cabecera.MotivoTraslado,
      cabecera.DescripcionMotivoTraslado,
      cabecera.FechaInicioTraslado,
      cabecera.TipoDocTransp,
      cabecera.NroRucTransportista,
      cabecera.RazonSocialTransportista,
      cabecera.NroRucPuntoLlegada,
      cabecera.DireccionPuntoLlegada,
      cabecera.CodUbigeoPartida,
      cabecera.NroRucPuntoPartida,
      cabecera.DireccionPuntoPartida,
      cabecera.PuntoEmision,
      cabecera.NroOrden,
      cabecera.Observacion,
    ];
  }

  /**
   * Aplica protección y colores a las celdas de Cabecera
   */
  private static aplicarProteccionCabecera(
    worksheet: ExcelJS.Worksheet,
    tipo: string
  ): void {
    const fila = worksheet.getRow(2);

    // Obtener columnas editables según tipo
    const editables =
      tipo === 'envio'
        ? COLUMNAS_EDITABLES.envio
        : COLUMNAS_EDITABLES.recojo;

    // Aplicar estilo a cada celda
    fila.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (editables.includes(colNumber)) {
        // Celda EDITABLE: fondo blanco
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORES_EXCEL.celda_editable.fondo },
        };
        cell.protection = { locked: false };
      } else {
        // Celda BLOQUEADA: fondo gris
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORES_EXCEL.celda_bloqueada.fondo },
        };
        cell.protection = { locked: true };
      }

      // Bordes para todas las celdas
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Proteger la hoja (permite editar celdas desbloqueadas)
    worksheet.protect('', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: false,
      insertColumns: false,
      insertHyperlinks: false,
      deleteRows: false,
      deleteColumns: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    });
  }

  /**
   * Crea la hoja "Detalle" con 4 columnas
   */
  private static crearHojaDetalle(
    worksheet: ExcelJS.Worksheet,
    data: GuiaRequestDTO,
    skus: SKUData[]
  ): void {
    // 1. Agregar headers
    worksheet.addRow(COLUMNAS_DETALLE);

    // 2. Estilizar headers
    this.estilizarHeaders(worksheet.getRow(1));

    // 3. Agregar filas de SKUs
    data.detalle.forEach((item) => {
      const sku = skus.find((s) => s.id === item.sku_id);

      const detalleRow: DetalleExcel = {
        GRE_ID: 1,
        Cantidad: item.cantidad,
        Sku: sku?.codigo_sku || '',
        Serie: item.serie || '',
      };

      worksheet.addRow([
        detalleRow.GRE_ID,
        detalleRow.Cantidad,
        detalleRow.Sku,
        detalleRow.Serie,
      ]);
    });

    // 4. Aplicar protección a columna GRE_ID
    this.aplicarProteccionDetalle(worksheet);

    // 5. Ajustar anchos de columnas
    worksheet.columns = [
      { width: ANCHOS_COLUMNAS.detalle.gre_id },
      { width: ANCHOS_COLUMNAS.detalle.cantidad },
      { width: ANCHOS_COLUMNAS.detalle.sku },
      { width: ANCHOS_COLUMNAS.detalle.serie },
    ];
  }

  /**
   * Aplica protección a la columna GRE_ID en Detalle
   */
  private static aplicarProteccionDetalle(
    worksheet: ExcelJS.Worksheet
  ): void {
    // Proteger solo columna GRE_ID (columna 1)
    worksheet.getColumn(1).eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        // Saltar header
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORES_EXCEL.celda_bloqueada.fondo },
        };
        cell.protection = { locked: true };
      }

      // Bordes
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Aplicar bordes a celdas editables también
    for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      row.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          // Columnas editables
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORES_EXCEL.celda_editable.fondo },
          };
          cell.protection = { locked: false };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      });
    }

    // Proteger la hoja
    worksheet.protect('', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: false,
      insertColumns: false,
      insertHyperlinks: false,
      deleteRows: false,
      deleteColumns: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    });
  }

  /**
   * Estiliza la fila de headers (azul + blanco + negrita)
   */
  private static estilizarHeaders(row: ExcelJS.Row): void {
    row.font = {
      bold: true,
      color: { argb: COLORES_EXCEL.header.texto },
      size: 11,
    };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORES_EXCEL.header.fondo },
    };
    row.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    row.height = 20;

    // Agregar bordes
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }
}