require('dotenv').config();

function required(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Variable de entorno requerida no definida: ${name}`);
  return val;
}

module.exports = {
  db: {
    server: required('DB_SERVER'),
    port: parseInt(process.env.DB_PORT || '1433'),
    database: required('DB_DATABASE'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  },
  gmail: {
    user: required('GMAIL_USER'),
    appPassword: required('GMAIL_APP_PASSWORD'),
  },
  report: {
    recipient: required('REPORT_RECIPIENT'),
    outputDir: process.env.OUTPUT_DIR || './reports',
  },
  cron: process.env.CRON_SCHEDULE || '0 8 * * *',
};
