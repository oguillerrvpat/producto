# ADR-005 — Gestión de configuración: dotenv + .env

**Estado**: Aceptado  
**Fecha**: 2026-05-20  
**Autores**: Equipo PatPrimo / Manufacturas Eliot

---

## Contexto

El pipeline requiere configuración externalizada para: credenciales SQL Server, Gmail App Password, correo destinatario, directorio de salida y schedule cron. Ningún valor sensible debe estar hardcodeado en el código fuente (SECURITY-12).

## Opciones evaluadas

| Opción | Seguridad | Versionable | Complejidad | Entorno local |
|---|---|---|---|---|
| **dotenv + .env** | `.env` en `.gitignore` | `.env.example` versionado | Mínima | Ideal |
| Variables de entorno del OS | Alta | No versionable | Media (configuración manual) | Tedioso |
| Azure Key Vault / AWS Secrets | Muy alta | Sí | Alta (requiere cloud) | Excesivo para MVP |
| Archivo `config.json` | Baja (riesgo commit) | Riesgo | Mínima | No recomendado |

## Decisión

**dotenv** leyendo desde archivo `.env` en la raíz del proyecto.

Razones:
- `.env` está en `.gitignore` — imposible commitear credenciales accidentalmente
- `.env.example` versionado documenta todas las variables requeridas sin exponer valores reales
- `config.js` valida en startup que todas las variables requeridas estén presentes — falla rápido con mensaje claro (SECURITY-15)
- Estándar de facto en proyectos Node.js, conocido por cualquier desarrollador

## Consecuencias

- **Positivo**: ninguna credencial puede llegar al repositorio GitHub (SECURITY-12 garantizado)
- **Positivo**: cambiar el schedule, destinatario o credenciales no requiere modificar código
- **Positivo**: `.env.example` sirve como documentación viva de la configuración
- **Negativo**: el desarrollador debe crear y mantener el `.env` manualmente en cada máquina
- **Regla**: nunca agregar `.env` a git aunque sea urgente — usar `.env.example` para compartir la estructura
