# ADR-004 — Envío de email: Gmail SMTP + nodemailer

**Estado**: Aceptado  
**Fecha**: 2026-05-20  
**Autores**: Equipo PatPrimo / Manufacturas Eliot

---

## Contexto

El pipeline debe enviar el reporte por email desde una cuenta corporativa hacia `orodriguez@patprimo.com.co` (Outlook). Se requiere soporte para adjuntos (Excel + TXT), reintentos ante fallos SMTP y autenticación segura sin exponer contraseñas.

## Opciones evaluadas

| Opción | Auth | Adjuntos | Reintentos | Costo | Complejidad |
|---|---|---|---|---|---|
| **Gmail SMTP + nodemailer** | App Password | Sí | Manual (implementado) | Gratis | Baja |
| SendGrid API | API Key | Sí | Automático | Freemium (100/día) | Media |
| AWS SES | IAM / SMTP | Sí | Manual | ~$0.10/1000 | Alta (requiere AWS) |
| Outlook SMTP (PatPrimo) | Usuario/pass corporativo | Sí | Manual | Gratis | Media |

## Decisión

**Gmail SMTP** (`smtp.gmail.com:587` con STARTTLS) autenticado con **App Password**, usando **nodemailer** como librería.

Razones:
- El solution brief especificó Gmail como origen del reporte
- App Password de Gmail es más seguro que la contraseña principal — se puede revocar individualmente
- nodemailer es la librería más madura del ecosistema Node.js para SMTP (>15M descargas/semana)
- STARTTLS en puerto 587 cumple con SECURITY-15 (cifrado en tránsito)
- Sin costo ni dependencia de servicios externos de pago

## Consecuencias

- **Positivo**: implementación simple, sin dependencias de cloud providers
- **Positivo**: App Password cumple SECURITY-12 — nunca se hardcodea la contraseña real
- **Negativo**: Gmail tiene límite de ~500 emails/día en cuentas gratuitas (no es una restricción para este caso: 1 email/día)
- **Negativo**: si la cuenta Gmail cambia su App Password, hay que actualizar el `.env`
- **Estrategia de reintentos**: máximo 3 intentos con backoff fijo de 5 minutos entre intentos
- **Migración futura**: si se requiere mayor volumen o auditoría de entregas, migrar a SendGrid API (cambio solo en `sendEmail.js`)
