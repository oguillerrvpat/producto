# ADR-003 — Generación Excel: exceljs

**Estado**: Aceptado  
**Fecha**: 2026-05-20  
**Autores**: Equipo PatPrimo / Manufacturas Eliot

---

## Contexto

El reporte debe generarse como archivo `.xlsx` con dos hojas: **Detalle** (errores formateados con estilos, monto COP) y **Resumen** (totales por tipo de error). Se requiere soporte para estilos de celda, formato de moneda colombiana y múltiples hojas.

## Opciones evaluadas

| Librería | Estilos | Múltiples hojas | Formato moneda | Mantenimiento |
|---|---|---|---|---|
| **exceljs** | Completo (fuente, fondo, bordes) | Sí | `numFmt` personalizado | Activo |
| `xlsx` (SheetJS) | Limitado en versión free | Sí | Limitado | Activo (core free) |
| `csv-writer` | No aplica (CSV) | No | No | Activo |

## Decisión

**exceljs** versión 4.x.

Razones:
- API fluida para aplicar estilos: encabezados con fondo azul (`FF1565C0`), fuente blanca y negrita
- Soporte nativo para `numFmt` con formato de moneda `"$"#,##0` (pesos colombianos)
- Escritura directa a archivo con `wb.xlsx.writeFile()` sin pasos intermedios
- Soporte para múltiples hojas en el mismo workbook (Detalle + Resumen)

## Consecuencias

- **Positivo**: el receptor recibe un Excel visualmente consistente y profesional
- **Positivo**: la hoja Resumen con totales por tipo de error se genera automáticamente
- **Negativo**: exceljs es más pesado que SheetJS para casos simples
- **Formato acordado**: columna Monto usa `"$"#,##0` (ej: `$156.000`), encabezados en azul `#1565C0` con texto blanco
