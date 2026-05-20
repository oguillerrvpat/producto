# C4 Diagrams — POS Error Reporter
## Sistema Automatizado de Reportería de Errores POS — Manufacturas Eliot

---

## Nivel 1 — Context

```mermaid
C4Context
    title Sistema de Reportería de Errores POS — Contexto

    Person(receptor, "Receptor del Reporte", "orodriguez@patprimo.com.co\nRevisa errores POS cada mañana")
    Person(dev, "Desarrollador / Operador", "Instala, configura y opera\nel pipeline localmente")

    System(pipeline, "POS Error Reporter", "Pipeline automatizado que extrae errores POS,\ngenera reporte Excel+TXT y lo envía por email\ncada día a las 08:00 AM")

    System_Ext(sqlserver, "SQL Server 2016+\n(Eliot DB)", "Base de datos de ventas POS.\nContiene ZCARLOGVENTAS con\nerrores de validación de tickets")

    System_Ext(gmail, "Gmail SMTP", "smtp.gmail.com:587\nServicio de envío de email\ncon App Password")

    System_Ext(outlook, "Outlook\n(PatPrimo)", "Cliente de correo del receptor.\nRecibe el reporte diario\ncomo adjunto Excel + TXT")

    Rel(pipeline, sqlserver, "Extrae errores del día", "mssql / TCP 1433")
    Rel(pipeline, gmail, "Envía reporte adjunto", "SMTP STARTTLS :587")
    Rel(gmail, outlook, "Entrega email", "SMTP")
    Rel(receptor, outlook, "Lee reporte diario", "")
    Rel(dev, pipeline, "Configura y opera", ".env / PM2")
```

---

## Nivel 2 — Container

```mermaid
C4Container
    title POS Error Reporter — Containers

    Person(receptor, "Receptor", "orodriguez@patprimo.com.co")
    Person(dev, "Desarrollador", "Opera el pipeline")

    System_Boundary(sys, "POS Error Reporter") {
        Container(scheduler, "Scheduler", "node-cron / PM2", "Dispara el pipeline\nautomáticamente a las 08:00 AM\no manualmente con --run-now")

        Container(pipeline, "Pipeline Service", "Node.js 20 LTS", "Orquesta el flujo completo:\nextracción → TXT → Excel → Email.\nEntry point: index.js")

        Container(reports, "Carpeta de Reportes", "File System local", "Almacena archivos generados:\nerrores_pos_YYYYMMDD.txt\nreporte_errores_pos_YYYYMMDD.xlsx\nRetención mínima 90 días")
    }

    System_Ext(sqlserver, "SQL Server\n(Eliot DB)", "ZCARLOGVENTAS + AUDIT_EMAIL_DELIVERY")
    System_Ext(gmail, "Gmail SMTP", "smtp.gmail.com:587")
    System_Ext(outlook, "Outlook", "Correo receptor")

    Rel(scheduler, pipeline, "Invoca", "función JS")
    Rel(pipeline, sqlserver, "Llama SP_GENERATE_ERROR_REPORT\nInserta en AUDIT_EMAIL_DELIVERY", "mssql / TCP 1433")
    Rel(pipeline, reports, "Escribe TXT y Excel", "fs / exceljs")
    Rel(pipeline, gmail, "Envía email con adjuntos", "nodemailer STARTTLS")
    Rel(gmail, outlook, "Entrega email", "SMTP")
    Rel(receptor, outlook, "Lee reporte", "")
    Rel(dev, scheduler, "Configura .env y PM2", "")
```

---

## Nivel 3 — Component (Pipeline Service)

```mermaid
C4Component
    title Pipeline Service — Components

    Container_Boundary(pipeline, "Pipeline Service — Node.js") {
        Component(index, "index.js\n(Orchestrator)", "Node.js", "Coordina el pipeline completo.\nManeja errores globales.\nInvoca módulos en secuencia.")

        Component(config, "config.js", "Node.js / dotenv", "Lee y valida variables de entorno.\nFalla rápido si faltan valores\nrequeridos (SECURITY-12).")

        Component(database, "database.js", "Node.js / mssql", "Conexión pool a SQL Server.\nEjecuta SP_GENERATE_ERROR_REPORT.\nRegistra en AUDIT_EMAIL_DELIVERY.")

        Component(exportTxt, "exportTxt.js", "Node.js / fs", "Genera archivo TXT delimitado\npor pipes con encabezados.\nNombre: errores_pos_YYYYMMDD.txt")

        Component(generateExcel, "generateExcel.js", "Node.js / exceljs", "Genera Excel .xlsx con\nhoja Detalle (errores ordenados)\ny hoja Resumen (totales por tipo).")

        Component(sendEmail, "sendEmail.js", "Node.js / nodemailer", "Envía email Gmail con adjuntos.\nReintentos: máx 3, backoff 5 min.\nSECURITY-15: manejo explícito errores.")
    }

    ContainerDb(sqlserver, "SQL Server", "Eliot DB", "ZCARLOGVENTAS\nAUDIT_EMAIL_DELIVERY")
    Container(reports, "File System", "reports/", "TXT + Excel generados")
    System_Ext(gmail, "Gmail SMTP", "smtp.gmail.com:587")

    Rel(index, config, "Lee configuración")
    Rel(index, database, "getErrorRecords()\nlogAudit()")
    Rel(index, exportTxt, "exportTxt(records, date)")
    Rel(index, generateExcel, "generateExcel(records, date)")
    Rel(index, sendEmail, "sendReport(paths, count, date)")

    Rel(database, sqlserver, "EXEC SP / INSERT", "mssql TCP 1433")
    Rel(exportTxt, reports, "Escribe .txt", "fs.writeFileSync")
    Rel(generateExcel, reports, "Escribe .xlsx", "exceljs")
    Rel(sendEmail, gmail, "SMTP STARTTLS", "nodemailer :587")
```

---

## Resumen de tecnologías

| Nivel | Componente | Tecnología |
|---|---|---|
| Container | Pipeline Service | Node.js 20 LTS |
| Container | Scheduler | node-cron + PM2 |
| Container | Reportes | File System local |
| Externo | Base de datos | SQL Server 2016+ |
| Externo | Email salida | Gmail SMTP (nodemailer) |
| Externo | Email entrada | Outlook (PatPrimo) |
| Componente | Config | dotenv |
| Componente | BD Driver | mssql |
| Componente | Excel | exceljs |
