const nodemailer = require('nodemailer');
const path = require('path');
const config = require('./config');

const MAX_RETRIES = 3;
const BACKOFF_MS = 5 * 60 * 1000;

function ddmmyyyy(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

async function sendReport({ txtPath, excelPath, errorCount, date }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.gmail.user,
      pass: config.gmail.appPassword,
    },
  });

  const dateStr = ddmmyyyy(date);

  const mailOptions = {
    from: config.gmail.user,
    to: config.report.recipient,
    subject: `[Manufacturas Eliot] Reporte de Errores POS - ${dateStr}`,
    html: `
      <h2>Reporte de Errores POS — ${dateStr}</h2>
      <p><strong>Total errores registrados:</strong> ${errorCount}</p>
      <p>Adjunto encontrará:</p>
      <ul>
        <li><strong>${path.basename(excelPath)}</strong> — Excel con hoja Detalle y Resumen</li>
        <li><strong>${path.basename(txtPath)}</strong> — Archivo plano delimitado por pipes</li>
      </ul>
      <hr>
      <small>Generado automáticamente · Pipeline POS Error Reporter · Manufacturas Eliot</small>
    `,
    attachments: [
      { filename: path.basename(excelPath), path: excelPath },
      { filename: path.basename(txtPath), path: txtPath },
    ],
  };

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return { success: true, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        console.warn(`[sendEmail] Intento ${attempt} fallido. Reintentando en 5 min...`);
        await new Promise(r => setTimeout(r, BACKOFF_MS));
      }
    }
  }

  const error = new Error(lastError.message);
  error.attempts = MAX_RETRIES;
  throw error;
}

module.exports = { sendReport };
