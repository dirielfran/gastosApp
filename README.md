# App Gastos CCS Solutions

Aplicación para el registro de gastos, ingresos y estadísticas. Desarrollada con **Ionic 8**, **Angular 20** y **Capacitor 8**.

## Características

- **Inicio:** balance del mes (ingresos, gastos y balance).
- **Explorar:** listado de movimientos con alta y edición (gastos e ingresos).
- **Cuentas:** gestión de cuentas con balance por cuenta.
- **Categorías:** categorías por defecto, crear/editar con selector de icono.
- **Presupuestos:** límite mensual por categoría y porcentaje de aviso.
- **Configuración:** idioma (español, inglés, portugués), tema (claro/oscuro/sistema), avisos de presupuesto.
- **Más:** acceso rápido a Cuentas, Categorías, Presupuestos y Configuración.

La base de datos usa **IndexedDB/sql.js** en web y **SQLite** en dispositivos nativos (Capacitor).

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo (web)

```bash
npm start
```

La app se abre en `http://localhost:4200`.

## Build (producción)

```bash
npm run build
```

La salida queda en `www/` (usada por Capacitor para Android/iOS).

## Plataformas nativas (Capacitor)

Añadir plataforma (si aún no está):

```bash
npx cap add android
# o
npx cap add ios
```

Sincronizar y abrir en el IDE:

```bash
npm run build
npx cap sync
npx cap open android   # o: npx cap open ios
```

## Scripts disponibles

| Comando        | Descripción                    |
|----------------|--------------------------------|
| `npm start`    | Servidor de desarrollo         |
| `npm run build`| Build de producción            |
| `npm run watch`| Build en modo watch            |
| `npm test`     | Tests unitarios (Karma/Jasmine)|
| `npm run lint` | Linter (ESLint)                |

## Documentación del proyecto

- [docs/FASE1_COMPROBACIONES.md](docs/FASE1_COMPROBACIONES.md) – Comprobaciones y notas de la Fase 1.
- [docs/FASE2_PLAN.md](docs/FASE2_PLAN.md) – Plan de trabajo Fase 2 (avisos de presupuesto, indicadores, estadísticas).

## Autor

**CCS Solutions**
