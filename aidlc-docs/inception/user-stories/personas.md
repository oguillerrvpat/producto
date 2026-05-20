# Personas (RESTART)
## Sistema Automatizado de Reportería de Errores POS — Manufacturas Eliot

---

## Persona 1: Receptor del Reporte

| Atributo | Detalle |
|---|---|
| **Email** | orodriguez@patprimo.com.co |
| **Rol** | Receptor del reporte diario de errores POS |
| **Herramienta** | Cliente de correo Outlook |

### Objetivo principal
Recibir cada mañana, a más tardar a las 08:30, un email con el reporte de errores POS del día anterior en formato Excel — listo para revisar sin procesamiento manual adicional.

### Motivaciones
- Tener el reporte disponible al inicio de la jornada laboral
- No depender de que nadie lo genere manualmente
- Poder abrir el Excel directamente y entender los errores del día en minutos
- Contar con un respaldo en archivo TXT para integraciones o análisis posteriores

### Frustraciones actuales
- El reporte llega tarde o no llega si la persona encargada está ausente
- El formato no es consistente entre días
- No hay evidencia de si el reporte fue enviado o no en días anteriores

### Criterio de éxito personal
> "Abro mi correo a las 08:30 y el reporte ya está. El Excel tiene el detalle de errores y el resumen de totales. En 5 minutos sé qué pasó con las ventas del día anterior."

### Historias relacionadas
- US-01, US-02, US-03, US-06

---

## Persona 2: Desarrollador / Operador Local

| Atributo | Detalle |
|---|---|
| **Rol** | Desarrollador que instala, configura y opera el sistema en su máquina local |
| **Herramienta** | Terminal, editor de código, archivo .env |

### Objetivo principal
Instalar el sistema en su máquina local, configurar las credenciales y el schedule, y asegurarse de que el pipeline corre correctamente cada día.

### Motivaciones
- Configurar el sistema de forma simple y reproducible
- Saber inmediatamente si algo falla sin tener que revisar logs manualmente
- Poder relanzar el pipeline manualmente si es necesario

### Criterio de éxito personal
> "Cloné el repo, copié .env.example a .env, llené las variables y corrí npm start. El pipeline funcionó en el primer intento."

### Historias relacionadas
- US-04, US-05, US-06, US-07
