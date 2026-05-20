# ADR-002 — Scheduler: node-cron + PM2

**Estado**: Aceptado  
**Fecha**: 2026-05-20  
**Autores**: Equipo PatPrimo / Manufacturas Eliot

---

## Contexto

El pipeline debe ejecutarse automáticamente a las 08:00 AM diariamente. Se requiere una solución de scheduling que funcione en la máquina local del desarrollador (Windows) sin depender de infraestructura adicional.

## Opciones evaluadas

| Opción | Pros | Contras |
|---|---|---|
| **node-cron + PM2** | Integrado en el proceso Node.js, logs automáticos, restart si falla | Requiere PM2 instalado |
| Windows Task Scheduler | Nativo del OS, sin dependencias extra | Configuración manual fuera del código, difícil de versionar |
| SQL Server Agent Job | Ya disponible si SQL Server está activo | Acopla el scheduling a SQL Server, fuera del scope del pipeline |
| Cron del sistema (Linux) | Estándar UNIX | Entorno es Windows |

## Decisión

**node-cron** para la lógica de scheduling dentro del proceso Node.js, gestionado por **PM2** como process manager.

Razones:
- La configuración del schedule vive en `.env` (`CRON_SCHEDULE`) — versionable y configurable sin tocar código
- PM2 reinicia el proceso si falla, registra logs con timestamps, y puede arrancar automáticamente con Windows
- El flag `--run-now` permite ejecución manual inmediata sin cambiar la configuración del scheduler

## Consecuencias

- **Positivo**: scheduling completamente configurable vía `.env`
- **Positivo**: PM2 provee monitoreo básico (`pm2 status`, `pm2 logs`) sin costo adicional
- **Positivo**: el mismo mecanismo funciona en Windows y Linux
- **Negativo**: PM2 debe instalarse globalmente (`npm install -g pm2`)
- **Decisión de configuración**: usar timezone `America/Bogota` para que las 08:00 AM sean hora colombiana
