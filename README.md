# POS Error Reporter — Manufacturas Eliot

Pipeline automatizado: errores ZCARLOGVENTAS → TXT → Excel → Email Gmail → Outlook

## Requisitos

- Node.js 20 LTS
- Acceso a SQL Server 2016+ con base de datos Eliot
- Cuenta Gmail con **App Password** habilitado

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de configuración
copy .env.example .env

# 3. Editar .env con tus valores reales
# (DB_SERVER, DB_PASSWORD, GMAIL_USER, GMAIL_APP_PASSWORD, etc.)
```

## Configurar Gmail App Password

1. Ir a [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Crear una App Password para "Mail"
3. Copiar las 16 letras (con espacios) en `GMAIL_APP_PASSWORD`

## Preparar SQL Server

Ejecutar los scripts en orden en SQL Server Management Studio:

```sql
-- 1. Crear tabla de auditoría
-- Ejecutar: sql/01_create_audit_table.sql

-- 2. Crear stored procedure
-- Ejecutar: sql/02_create_sp.sql
-- ⚠️  Ajustar nombres de columnas si ZCARLOGVENTAS tiene nombres diferentes
```

## Uso

```bash
# Ejecutar el pipeline ahora (una sola vez)
npm run report

# Iniciar scheduler (corre cada día a las 08:00 AM)
npm start
```

## Estructura del proyecto

```
├── index.js              # Orquestador + scheduler
├── src/
│   ├── config.js         # Lectura y validación de .env
│   ├── database.js       # Conexión SQL Server, SP y auditoría
│   ├── exportTxt.js      # Genera archivo TXT pipes
│   ├── generateExcel.js  # Genera Excel (Detalle + Resumen)
│   └── sendEmail.js      # Envío Gmail con reintentos
├── sql/
│   ├── 01_create_audit_table.sql
│   └── 02_create_sp.sql
└── reports/              # Archivos generados (auto-creado)
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DB_SERVER` | Host SQL Server |
| `DB_DATABASE` | Nombre de la base de datos |
| `DB_USER` | Usuario SQL Server |
| `DB_PASSWORD` | Contraseña SQL Server |
| `GMAIL_USER` | Correo Gmail origen |
| `GMAIL_APP_PASSWORD` | App Password de Gmail |
| `REPORT_RECIPIENT` | Correo destinatario (Outlook) |
| `OUTPUT_DIR` | Carpeta para TXT y Excel (default: `./reports`) |
| `CRON_SCHEDULE` | Expresión cron (default: `0 8 * * *`) |
