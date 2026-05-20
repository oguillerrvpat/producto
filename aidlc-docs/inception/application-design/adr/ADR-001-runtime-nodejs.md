# ADR-001 — Runtime: Node.js 20 LTS

**Estado**: Aceptado  
**Fecha**: 2026-05-20  
**Autores**: Equipo PatPrimo / Manufacturas Eliot

---

## Contexto

El pipeline necesita un runtime para orquestar: conexión SQL Server, generación de archivos (TXT, Excel) y envío de email SMTP. Se evaluaron tres opciones: Node.js, Python y Java.

## Opciones evaluadas

| Criterio | Node.js 20 LTS | Python 3.12 | Java 21 |
|---|---|---|---|
| Soporte nativo mssql | `mssql` (oficial) | `pyodbc` / `pymssql` | JDBC |
| Generación Excel | `exceljs` (estilos completos) | `openpyxl` | Apache POI |
| Email SMTP | `nodemailer` (maduro) | `smtplib` (stdlib) | JavaMail |
| Peso del runtime | Ligero | Ligero | Pesado |
| Scheduler integrado | `node-cron` + PM2 | APScheduler | Quartz |
| Familiaridad equipo | Alta | Media | Baja |

## Decisión

**Node.js 20 LTS** con PM2 como process manager.

Razones:
- El solution brief original recomendó Node.js explícitamente
- `exceljs` ofrece la API más completa para generar Excel con estilos, múltiples hojas y formatos COP
- `mssql` es el driver oficial de Microsoft para Node.js con SQL Server
- PM2 provee scheduling cron, restart automático y logs sin infraestructura adicional

## Consecuencias

- **Positivo**: stack consistente, paquetes maduros para cada necesidad del pipeline
- **Positivo**: PM2 elimina la necesidad de configurar Windows Task Scheduler o SQL Agent
- **Negativo**: el equipo debe mantener Node.js 20 LTS instalado en la máquina local
- **Riesgo mitigado**: Node.js 20 LTS tiene soporte hasta abril 2026 — migrar a Node.js 22 LTS cuando sea necesario
