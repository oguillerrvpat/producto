const ExcelJS = require('exceljs');
const path = require('path');
const config = require('./config');

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };

function yyyymmdd(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function ddmmyyyy(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

async function generateExcel(records, date) {
  const dir = config.report.outputDir;
  const filename = `reporte_errores_pos_${yyyymmdd(date)}.xlsx`;
  const filepath = path.join(dir, filename);

  const wb = new ExcelJS.Workbook();

  // ---- Hoja Detalle ----
  const wsD = wb.addWorksheet('Detalle');
  wsD.columns = [
    { header: 'Fecha/Hora',    key: 'fecha_hora',  width: 22 },
    { header: 'Tienda',        key: 'tienda',       width: 15 },
    { header: 'Tipo de Error', key: 'tipo_error',   width: 22 },
    { header: 'Descripción',   key: 'descripcion',  width: 38 },
    { header: 'Producto',      key: 'producto',     width: 22 },
    { header: 'Monto COP',     key: 'monto',        width: 15 },
    { header: 'Severidad',     key: 'severidad',    width: 12 },
  ];

  wsD.getRow(1).eachCell(cell => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const sorted = [...records].sort((a, b) => {
    if ((a.tienda ?? '') < (b.tienda ?? '')) return -1;
    if ((a.tienda ?? '') > (b.tienda ?? '')) return 1;
    return (b.monto ?? 0) - (a.monto ?? 0);
  });

  for (const r of sorted) {
    const row = wsD.addRow(r);
    row.getCell('monto').numFmt = '"$"#,##0';
  }

  // ---- Hoja Resumen ----
  const wsR = wb.addWorksheet('Resumen');

  const totalErrores = records.length;
  const totalCOP = records.reduce((s, r) => s + (r.monto ?? 0), 0);
  const tiendasAfectadas = new Set(records.map(r => r.tienda)).size;

  wsR.addRow(['Reporte de Errores POS — Manufacturas Eliot']);
  wsR.addRow([`Fecha: ${ddmmyyyy(date)}`]);
  wsR.addRow([]);
  wsR.addRow(['Total errores del día', totalErrores]);
  wsR.addRow(['Total COP en error', totalCOP]);
  wsR.addRow(['Tiendas afectadas', tiendasAfectadas]);
  wsR.addRow([]);
  wsR.addRow(['Tipo de Error', 'Cantidad', 'Total COP']);

  wsR.getRow(8).eachCell(cell => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
  });

  const byType = {};
  for (const r of records) {
    const t = r.tipo_error || 'DESCONOCIDO';
    if (!byType[t]) byType[t] = { count: 0, total: 0 };
    byType[t].count++;
    byType[t].total += r.monto ?? 0;
  }

  for (const [tipo, data] of Object.entries(byType)) {
    const row = wsR.addRow([tipo, data.count, data.total]);
    row.getCell(3).numFmt = '"$"#,##0';
  }

  wsR.getRow(5).getCell(2).numFmt = '"$"#,##0';
  wsR.getColumn(1).width = 30;
  wsR.getColumn(2).width = 12;
  wsR.getColumn(3).width = 18;

  await wb.xlsx.writeFile(filepath);
  return filepath;
}

module.exports = { generateExcel };
