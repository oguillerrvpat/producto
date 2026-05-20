# ADR Index — POS Error Reporter
## Architecture Decision Records — Manufacturas Eliot

---

| ADR | Título | Estado | Fecha |
|---|---|---|---|
| [ADR-001](ADR-001-runtime-nodejs.md) | Runtime: Node.js 20 LTS | Aceptado | 2026-05-20 |
| [ADR-002](ADR-002-scheduler-pm2-cron.md) | Scheduler: node-cron + PM2 | Aceptado | 2026-05-20 |
| [ADR-003](ADR-003-excel-exceljs.md) | Generación Excel: exceljs | Aceptado | 2026-05-20 |
| [ADR-004](ADR-004-email-gmail-smtp.md) | Envío de email: Gmail SMTP + nodemailer | Aceptado | 2026-05-20 |
| [ADR-005](ADR-005-config-dotenv.md) | Gestión de configuración: dotenv + .env | Aceptado | 2026-05-20 |
| [ADR-006](ADR-006-storage-filesystem.md) | Almacenamiento de reportes: File System local | Aceptado | 2026-05-20 |

---

## Resumen de decisiones

```
Runtime        Node.js 20 LTS
Scheduler      node-cron (dentro del proceso) + PM2 (process manager)
Excel          exceljs  --> hojas Detalle + Resumen, estilos, formato COP
Email          nodemailer --> Gmail SMTP :587 STARTTLS, 3 reintentos
Config         dotenv + .env  --> .gitignored, .env.example versionado
Storage        File System local ./reports/  --> retención manual 90 dias
BD Driver      mssql (driver oficial Microsoft para Node.js)
Auditoría      AUDIT_EMAIL_DELIVERY (SQL Server, append-only)
```
