# ADR-006 — Almacenamiento de reportes: File System local

**Estado**: Aceptado  
**Fecha**: 2026-05-20  
**Autores**: Equipo PatPrimo / Manufacturas Eliot

---

## Contexto

Los archivos TXT y Excel generados deben almacenarse para retención mínima de 90 días (NFR-05). El entorno es una máquina local del desarrollador sin infraestructura cloud disponible en esta fase.

## Opciones evaluadas

| Opción | Retención | Costo | Complejidad | Disponible offline |
|---|---|---|---|---|
| **File System local** (`reports/`) | Manual (90 días) | Gratis | Mínima | Sí |
| SQL Server (BLOB/VARBINARY) | Automática con queries | Gratis | Media | Sí |
| SharePoint / OneDrive | Automática | Incluido en M365 | Media | No (requiere red) |
| Azure Blob Storage | Configurable | ~$0.02/GB/mes | Alta | No (requiere cloud) |

## Decisión

**File System local** en directorio `./reports/` configurable vía `OUTPUT_DIR` en `.env`.

Razones:
- Entorno de ejecución es máquina local — el acceso a cloud no está en scope del MVP
- Los archivos son el respaldo natural del reporte: si el email falla, el archivo local permite reenvío manual
- Directorio configurable permite mover los reportes a una carpeta de red compartida sin cambiar código
- Simplicidad total: `fs.writeFileSync` y `exceljs.writeFile` sin dependencias adicionales

## Consecuencias

- **Positivo**: cero dependencias externas para el almacenamiento
- **Positivo**: los archivos quedan accesibles localmente para revisión o reenvío manual
- **Negativo**: la retención de 90 días es responsabilidad manual del operador (no hay limpieza automática)
- **Negativo**: si la máquina falla, los reportes locales se pierden — el único respaldo es `AUDIT_EMAIL_DELIVERY`
- **Pendiente futuro**: implementar limpieza automática de archivos con más de 90 días (`fs.readdirSync` + `fs.unlinkSync`)
- **Pendiente futuro**: evaluar migración a carpeta de red o SharePoint si se requiere acceso multi-usuario
