require('dotenv').config();
const cron = require('node-cron');
const config = require('./src/config');
const { getErrorRecords, logAudit, closePool } = require('./src/database');
const { exportTxt } = require('./src/exportTxt');
const { generateExcel } = require('./src/generateExcel');
const { sendReport } = require('./src/sendEmail');

async function runPipeline() {
  const date = new Date();
  const ts = () => new Date().toISOString();

  console.log(`[${ts()}] Pipeline iniciado`);

  let txtPath = null;
  let excelPath = null;
  let records = null;

  try {
    records = await getErrorRecords(date);
    console.log(`[${ts()}] ${records.length} errores obtenidos de SQL Server`);

    txtPath = await exportTxt(records, date);
    console.log(`[${ts()}] TXT generado: ${txtPath}`);

    excelPath = await generateExcel(records, date);
    console.log(`[${ts()}] Excel generado: ${excelPath}`);

    const result = await sendReport({ txtPath, excelPath, errorCount: records.length, date });
    console.log(`[${ts()}] Email enviado en ${result.attempts} intento(s) a ${config.report.recipient}`);

    await logAudit({
      status: 'SUCCESS',
      recipient: config.report.recipient,
      txtFile: txtPath,
      excelFile: excelPath,
      errorCount: records.length,
      retryCount: result.attempts - 1,
    });

    console.log(`[${ts()}] Pipeline completado exitosamente`);
  } catch (err) {
    const errorMessage = err.message || String(err);
    console.error(`[${ts()}] ERROR en pipeline: ${errorMessage}`);

    try {
      await logAudit({
        status: 'FAILED',
        recipient: config.report.recipient,
        txtFile: txtPath,
        excelFile: excelPath,
        errorCount: records ? records.length : 0,
        errorMessage,
        retryCount: err.attempts ? err.attempts - 1 : 0,
      });
    } catch (auditErr) {
      console.error(`[${ts()}] Error al registrar auditoría: ${auditErr.message}`);
    }

    process.exitCode = 1;
  } finally {
    await closePool().catch(() => {});
  }
}

const runNow = process.argv.includes('--run-now');

if (runNow) {
  runPipeline();
} else {
  console.log(`[${new Date().toISOString()}] Scheduler activo. Cron: ${config.cron}`);
  cron.schedule(config.cron, runPipeline, { timezone: 'America/Bogota' });
}
