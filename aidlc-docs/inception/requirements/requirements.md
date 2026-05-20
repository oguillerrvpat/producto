# Requirements Document (RESTART)
## Sistema Automatizado de Reportería de Errores POS — Manufacturas Eliot / PatPrimo

---

## Intent Analysis

| Campo | Valor |
|---|---|
| **User Request** | Pipeline automatizado: errores ZCARLOGVENTAS → archivo TXT (pipes) → Excel (.xlsx) → email Gmail → orodriguez@patprimo.com.co |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | Multiple Components: SP SQL Server + Servicio + entrega por email |
| **Complexity Estimate** | Moderate |
| **Source Document** | SOLUTION_BRIEF_LOGVENTAMANUFACTURA_ELIOT.md (Mayo 2026) |

---

## Contexto de Negocio

- **Cliente**: Manufacturas Eliot — 100 tiendas POS operativas (Colombia)
- **Problema**: Reporte diario de errores generado manualmente, delay T+1, bus factor = 1
- **Destinatario del reporte**: orodriguez@patprimo.com.co (Outlook)
- **Tablas fuente**: `TLOGF` (ventas válidas) + `ZCARLOGVENTAS` (errores de validación)
- **Volumen estimado**: ~5.000 tickets/día, ~100-250 errores/día (2-5% tasa de error)
- **Entorno de desarrollo**: Máquina local del desarrollador

---

## Functional Requirements

### FR-01: Extracción de errores desde SQL Server
- El sistema DEBE conectarse a SQL Server 2016+ de Eliot
- DEBE invocar `SP_GENERATE_ERROR_REPORT` para extraer los errores del día desde `ZCARLOGVENTAS`
- Campos requeridos: código de error, descripción, tienda, producto, monto, fecha/hora, severidad
- La extracción DEBE ser de solo lectura (sin modificar datos existentes)

### FR-02: Exportación a archivo plano TXT
- El sistema DEBE generar un archivo `.txt` delimitado por pipes (`|`) con los registros de error del día
- La primera línea DEBE contener los encabezados de columnas separados por `|`
- El archivo DEBE nombrarse con la fecha: `errores_pos_YYYYMMDD.txt`
- El archivo DEBE guardarse en un directorio configurable

### FR-03: Conversión a Excel (.xlsx)
- El sistema DEBE convertir el archivo TXT a formato `.xlsx`
- El Excel DEBE incluir:
  - **Hoja "Detalle"**: listado completo de errores con columnas formateadas
  - Encabezados con estilo (negrita, fondo de color)
  - Columna de monto formateada como moneda COP
  - **Hoja "Resumen"**: total de errores, total COP en error, desglose por tipo de error
- El archivo Excel DEBE nombrarse `reporte_errores_pos_YYYYMMDD.xlsx`

### FR-04: Envío de email desde Gmail a Outlook
- El sistema DEBE enviar el Excel como adjunto por email
- **Origen**: cuenta Gmail (SMTP smtp.gmail.com:587, STARTTLS)
- **Destino**: orodriguez@patprimo.com.co (Outlook)
- **Asunto**: `[Manufacturas Eliot] Reporte de Errores POS - DD/MM/YYYY`
- **Cuerpo**: resumen en HTML/texto con totales del día
- El sistema DEBE incluir el archivo TXT como segundo adjunto
- El sistema DEBE reintentar el envío ante fallo SMTP (máximo 3 intentos, backoff de 5 min)

### FR-05: Ejecución programada automática
- El pipeline DEBE ejecutarse automáticamente a las **08:00 AM diariamente**
- Scheduler: cron del sistema operativo (local) o PM2 cron
- El sistema DEBE alertar si el pipeline falla (log en consola + email de alerta configurable)

### FR-06: Auditoría de envíos
- El sistema DEBE registrar cada intento en la tabla `AUDIT_EMAIL_DELIVERY`:
  - timestamp de inicio y fin, estado (SUCCESS/FAILED/RETRYING)
  - destinatario, nombre de archivos adjuntos, número de errores en el reporte, mensaje de error

### FR-07: Configuración externalizada
- Todos los parámetros DEBEN estar en archivo `.env` (NO hardcodeados):
  - Cadena de conexión SQL Server
  - Credenciales Gmail (App Password o OAuth2 token)
  - Email destinatario
  - Directorio de archivos de salida
  - Hora de ejecución programada

---

## Non-Functional Requirements

### NFR-01: Rendimiento
- El pipeline completo DEBE completar en menos de **5 minutos** para ≤ 250 errores/día

### NFR-02: Entorno de ejecución
- **Desarrollo/ejecución**: Máquina local del desarrollador
- **Runtime**: Node.js 20 LTS (recomendado por solution brief) gestionado por PM2
- **Base de datos**: SQL Server 2016+ (sin migración; solo se añaden SP y tabla de auditoría)

### NFR-03: Seguridad (reglas esenciales habilitadas)

| Regla | Descripción | Estado |
|---|---|---|
| **SECURITY-03** | Logging estructurado — sin PII ni credenciales en logs | Habilitada (bloqueante) |
| **SECURITY-12** | Credenciales Gmail en variables de entorno — no hardcodeadas | Habilitada (bloqueante) |
| **SECURITY-15** | Manejo explícito de errores en todas las llamadas externas (BD, SMTP) | Habilitada (bloqueante) |
| SECURITY-01,02,04-11,13,14 | No aplicables en entorno local / MVP | N/A |

### NFR-04: Mantenibilidad
- Código en repositorio Git con `README.md` de instalación y uso
- Cobertura de tests unitarios ≥ 60% para la lógica de negocio

### NFR-05: Trazabilidad
- Archivos TXT y Excel DEBEN retenerse localmente por mínimo 90 días
- Todo envío DEBE quedar en `AUDIT_EMAIL_DELIVERY`

---

## Stack Tecnológico Recomendado

| Capa | Tecnología | Justificación |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Alineado con solution brief; excelente soporte para mssql, nodemailer, exceljs |
| **BD driver** | `mssql` | Driver oficial SQL Server |
| **Email** | `nodemailer` | SMTP Gmail con STARTTLS |
| **Excel/TXT** | `exceljs` | Generación .xlsx con estilos y múltiples hojas |
| **Scheduler** | `node-cron` o PM2 cron | Ejecución a las 08:00 AM |
| **Testing** | Jest | Unit tests |
| **Config** | `dotenv` | Variables de entorno desde .env |

> **Nota**: Stack es recomendación basada en el solution brief. Puede cambiarse a Python si se prefiere.

---

## Componentes a Construir

| Componente | Tipo | Descripción |
|---|---|---|
| `SP_GENERATE_ERROR_REPORT` | T-SQL SP | Extrae errores del día de ZCARLOGVENTAS |
| `AUDIT_EMAIL_DELIVERY` | Tabla SQL Server | Registro de cada ejecución del pipeline |
| `ErrorReportService` | Orquestador Node.js | Coordina el pipeline completo |
| `flatFileExporter` | Módulo Node.js | Genera TXT delimitado por pipes |
| `excelGenerator` | Módulo Node.js | Convierte TXT a .xlsx con estilos |
| `emailSender` | Módulo Node.js | Envía email Gmail + reintentos |
| `auditLogger` | Módulo Node.js | Escribe en AUDIT_EMAIL_DELIVERY |
| `config` | Módulo Node.js | Lee y valida .env |
| `.env` | Config file | Variables de entorno (no commiteado) |
| `.env.example` | Plantilla | Ejemplo sin valores reales |

---

## Criterios de Aceptación (DoD)

- [ ] Pipeline corre a las 08:00 AM sin intervención manual
- [ ] Email llega a orodriguez@patprimo.com.co con Excel y TXT adjuntos
- [ ] Excel contiene hoja Detalle + hoja Resumen con formato correcto
- [ ] TXT generado con pipes `|` y encabezados
- [ ] Todo envío registrado en `AUDIT_EMAIL_DELIVERY`
- [ ] Ninguna credencial hardcodeada en código fuente (SECURITY-12)
- [ ] Logs sin datos sensibles ni credenciales (SECURITY-03)
- [ ] Errores de BD y SMTP manejados explícitamente (SECURITY-15)
- [ ] Pipeline completa en menos de 5 minutos
- [ ] README con instrucciones de instalación y configuración

---

## Scope OUT (no incluido)

- Dashboard web
- Reconciliación automática TLOGF vs fuente POS
- Reintentos de tickets rechazados
- Auditoría de accesos en ZCARLOGVENTAS (triggers)
- Autenticación de usuarios
- Despliegue en servidor / cloud
