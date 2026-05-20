const sql = require('mssql');
const config = require('./config');

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect({
      server: config.db.server,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      options: config.db.options,
    });
  }
  return pool;
}

async function getErrorRecords(date) {
  const p = await getPool();
  const result = await p.request()
    .input('fecha', sql.Date, date)
    .execute('SP_GENERATE_ERROR_REPORT');
  return result.recordset;
}

async function logAudit({ status, recipient, txtFile, excelFile, errorCount, errorMessage, retryCount }) {
  const p = await getPool();
  await p.request()
    .input('status', sql.VarChar(20), status)
    .input('recipient', sql.VarChar(200), recipient)
    .input('txt_file', sql.VarChar(500), txtFile || null)
    .input('excel_file', sql.VarChar(500), excelFile || null)
    .input('error_count', sql.Int, errorCount || 0)
    .input('error_message', sql.VarChar(2000), errorMessage || null)
    .input('retry_count', sql.Int, retryCount || 0)
    .query(`
      INSERT INTO AUDIT_EMAIL_DELIVERY
        (timestamp_inicio, timestamp_fin, status, recipient, txt_file, excel_file, error_count, error_message, retry_count)
      VALUES
        (GETDATE(), GETDATE(), @status, @recipient, @txt_file, @excel_file, @error_count, @error_message, @retry_count)
    `);
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = { getErrorRecords, logAudit, closePool };
