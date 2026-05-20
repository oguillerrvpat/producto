# User Stories (RESTART)
## Sistema Automatizado de Reportería de Errores POS — Manufacturas Eliot

**Organización**: Feature-Based
**Criterios de aceptación**: Nivel medio (3-5 Given/When/Then)
**Total**: 7 historias | 2 personas | 5 feature groups

---

## FEATURE GROUP 1: Recepción del Reporte

### US-01: Recepción del email con reporte antes de las 08:30

**Como** receptor del reporte (orodriguez@patprimo.com.co),
**quiero** recibir automáticamente un email con el reporte de errores POS antes de las 08:30,
**para** tener la información disponible al inicio de mi jornada sin esperar a nadie.

**Persona**: Receptor del Reporte
**Prioridad**: Alta | **Estimación**: 3 puntos

| # | Given | When | Then |
|---|---|---|---|
| AC-01.1 | Dado que el pipeline corre a las 08:00 y SQL Server está disponible | Cuando completa la generación y el envío Gmail | Entonces el email llega a orodriguez@patprimo.com.co antes de las 08:30 |
| AC-01.2 | Dado que el email fue enviado | Cuando el receptor lo abre | Entonces contiene dos adjuntos: `reporte_errores_pos_YYYYMMDD.xlsx` y `errores_pos_YYYYMMDD.txt` |
| AC-01.3 | Dado que el pipeline corrió exitosamente | Cuando se revisa `AUDIT_EMAIL_DELIVERY` | Entonces existe un registro con `status = SUCCESS` y el timestamp de entrega |
| AC-01.4 | Dado que no hay errores ese día en ZCARLOGVENTAS | Cuando se genera el reporte | Entonces el email se envía igualmente indicando "0 errores registrados" |

**INVEST**: Independent ✓ | Negotiable ✓ | Valuable ✓ | Estimable ✓ | Small ✓ | Testable ✓

---

## FEATURE GROUP 2: Contenido del Reporte

### US-02: Visualización de errores por tienda y producto en el Excel

**Como** receptor del reporte,
**quiero** que el Excel muestre los errores del día con columnas claras (tienda, producto, monto COP, tipo de error),
**para** identificar rápidamente qué tienda o producto tiene más problemas.

**Persona**: Receptor del Reporte
**Prioridad**: Alta | **Estimación**: 3 puntos

| # | Given | When | Then |
|---|---|---|---|
| AC-02.1 | Dado que hay errores en ZCARLOGVENTAS | Cuando se genera el Excel | Entonces la hoja "Detalle" contiene columnas: Hora, Tienda, Tipo de Error, Producto, Monto COP, Severidad con encabezados en negrita y fondo azul |
| AC-02.2 | Dado que el Excel fue generado | Cuando el receptor lo abre | Entonces los registros están ordenados por Tienda (A-Z) y dentro de cada tienda por Monto COP descendente |
| AC-02.3 | Dado que el Excel fue generado | Cuando el receptor revisa la columna Monto | Entonces los valores están formateados como moneda colombiana (ej. $156.000) |

**INVEST**: Independent ✓ | Valuable ✓ | Estimable ✓ | Small ✓ | Testable ✓

---

### US-03: Resumen de totales en hoja Resumen

**Como** receptor del reporte,
**quiero** que el Excel incluya una hoja "Resumen" con el total de errores y el COP total en error,
**para** tener una visión ejecutiva del día en menos de 30 segundos.

**Persona**: Receptor del Reporte
**Prioridad**: Alta | **Estimación**: 2 puntos

| # | Given | When | Then |
|---|---|---|---|
| AC-03.1 | Dado que el Excel fue generado | Cuando el receptor abre la hoja "Resumen" | Entonces muestra: total de errores del día, COP total en error, número de tiendas afectadas |
| AC-03.2 | Dado que hay múltiples tipos de error | Cuando el receptor revisa la hoja Resumen | Entonces hay una tabla con conteo y COP por cada tipo de error |
| AC-03.3 | Dado que el Excel fue generado | Cuando el receptor revisa el asunto del email | Entonces dice `[Manufacturas Eliot] Reporte de Errores POS - DD/MM/YYYY` con la fecha correcta |

**INVEST**: Independent ✓ | Valuable ✓ | Estimable ✓ | Small ✓ | Testable ✓

---

## FEATURE GROUP 3: Manejo de Fallos

### US-04: Reintentos automáticos ante fallo SMTP

**Como** desarrollador/operador local,
**quiero** que el sistema reintente el envío SMTP hasta 3 veces con backoff de 5 minutos,
**para** que fallos transitorios de red o disponibilidad de Gmail no impidan la entrega.

**Persona**: Desarrollador / Operador Local
**Prioridad**: Media | **Estimación**: 2 puntos

| # | Given | When | Then |
|---|---|---|---|
| AC-04.1 | Dado que el primer intento SMTP falla | Cuando el sistema detecta el error | Entonces espera 5 minutos y realiza un segundo intento automáticamente |
| AC-04.2 | Dado que el segundo intento también falla | Cuando transcurren 5 minutos más | Entonces realiza un tercer y último intento |
| AC-04.3 | Dado que un reintento tiene éxito | Cuando el email es entregado | Entonces `AUDIT_EMAIL_DELIVERY` registra `status = SUCCESS` y `retry_count` con el número de intentos |

**INVEST**: Independent ✓ | Estimable ✓ | Small ✓ | Testable ✓ (mockear SMTP en unit tests)

---

### US-05: Registro y visibilidad del fallo del pipeline

**Como** desarrollador/operador local,
**quiero** que cuando el pipeline falle definitivamente (3 reintentos agotados) quede registrado claramente en el log y en `AUDIT_EMAIL_DELIVERY`,
**para** poder diagnosticar el problema y relanzar manualmente sin perder contexto.

**Persona**: Desarrollador / Operador Local
**Prioridad**: Alta | **Estimación**: 2 puntos

| # | Given | When | Then |
|---|---|---|---|
| AC-05.1 | Dado que los 3 reintentos se agotaron | Cuando el sistema registra el fallo | Entonces `AUDIT_EMAIL_DELIVERY` tiene `status = FAILED`, `retry_count = 3` y `error_message` con el detalle del error |
| AC-05.2 | Dado que ocurrió un fallo | Cuando el desarrollador revisa la consola o los logs | Entonces el mensaje de error indica el tipo de fallo (conexión BD / SMTP) sin exponer credenciales |
| AC-05.3 | Dado que el pipeline falló | Cuando el desarrollador ejecuta el pipeline manualmente | Entonces el sistema acepta la ejecución manual y registra el nuevo intento en `AUDIT_EMAIL_DELIVERY` |

**INVEST**: Valuable ✓ | Testable ✓ (simular fallo en STAGING/local)

---

## FEATURE GROUP 4: Auditoría

### US-06: Consulta del historial de envíos

**Como** receptor del reporte o desarrollador,
**quiero** poder consultar `AUDIT_EMAIL_DELIVERY` para ver si el reporte fue enviado en una fecha específica,
**para** confirmar la entrega o diagnosticar por qué no llegó.

**Persona**: Receptor del Reporte / Desarrollador
**Prioridad**: Media | **Estimación**: 1 punto

| # | Given | When | Then |
|---|---|---|---|
| AC-06.1 | Dado que se ejecutaron envíos los últimos 30 días | Cuando se consulta por fecha | Entonces se puede determinar si el reporte fue enviado exitosamente o no, con el timestamp exacto |
| AC-06.2 | Dado que hubo un fallo | Cuando se consulta el registro | Entonces `error_message` y `retry_count` permiten diagnosticar la causa |
| AC-06.3 | Dado que los registros son de auditoría | Cuando el sistema escribe en la tabla | Entonces solo hace INSERT — nunca UPDATE ni DELETE sobre registros históricos |

**INVEST**: Independent ✓ | Valuable ✓ | Small ✓ | Testable ✓

---

## FEATURE GROUP 5: Setup y Configuración

### US-07: Instalación y configuración del sistema localmente

**Como** desarrollador,
**quiero** poder instalar y configurar el sistema en mi máquina local siguiendo instrucciones claras,
**para** tener el pipeline funcionando en menos de 30 minutos desde cero.

**Persona**: Desarrollador / Operador Local
**Prioridad**: Alta | **Estimación**: 1 punto

| # | Given | When | Then |
|---|---|---|---|
| AC-07.1 | Dado que tengo Node.js 20 y acceso a SQL Server | Cuando ejecuto `npm install` y copio `.env.example` a `.env` con mis valores | Entonces el pipeline corre sin errores en el primer intento |
| AC-07.2 | Dado que el `.env` está configurado | Cuando ejecuto el pipeline manualmente (`node index.js` o `npm run report`) | Entonces genera el TXT, el Excel y envía el email en menos de 5 minutos |
| AC-07.3 | Dado que quiero el pipeline automático a las 08:00 | Cuando configuro PM2 o el cron del sistema | Entonces el schedule queda activo y se confirma con un log de inicio |

**INVEST**: Independent ✓ | Valuable ✓ | Small ✓ | Testable ✓

---

## Mapa Personas → Historias

| Historia | Receptor del Reporte | Desarrollador/Operador |
|---|:---:|:---:|
| US-01 Recepción email antes de 08:30 | X | |
| US-02 Visualización errores en Excel | X | |
| US-03 Resumen totales en hoja Resumen | X | |
| US-04 Reintentos automáticos SMTP | | X |
| US-05 Registro y visibilidad de fallos | | X |
| US-06 Historial de envíos (auditoría) | X | X |
| US-07 Instalación y configuración local | | X |

---

## Resumen

| Métrica | Valor |
|---|---|
| Total historias | 7 |
| Prioridad Alta | 5 (US-01, 02, 03, 05, 07) |
| Prioridad Media | 2 (US-04, 06) |
| Total puntos | 14 |
| Personas | 2 |
| Feature groups | 5 |
| Todas cumplen INVEST | Sí |
