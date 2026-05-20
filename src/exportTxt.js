const fs = require('fs');
const path = require('path');
const config = require('./config');

function yyyymmdd(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

async function exportTxt(records, date) {
  const dir = config.report.outputDir;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `errores_pos_${yyyymmdd(date)}.txt`;
  const filepath = path.join(dir, filename);

  const headers = ['FECHA_HORA', 'TIENDA', 'TIPO_ERROR', 'DESCRIPCION', 'PRODUCTO', 'MONTO_COP', 'SEVERIDAD'];
  const lines = [headers.join('|')];

  for (const r of records) {
    lines.push([
      r.fecha_hora ?? '',
      r.tienda ?? '',
      r.tipo_error ?? '',
      r.descripcion ?? '',
      r.producto ?? '',
      r.monto ?? 0,
      r.severidad ?? '',
    ].join('|'));
  }

  fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
  return filepath;
}

module.exports = { exportTxt };
