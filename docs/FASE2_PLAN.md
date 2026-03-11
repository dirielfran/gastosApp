# Fase 2 – Análisis y plan de trabajo

## 1. Resumen de lo ya construido (Fase 1)

- **Tabs:** Inicio, Explorar, Más.
- **Cuentas:** listado, alta, edición; balance por cuenta.
- **Movimientos:** listado, alta (gasto/ingreso), edición; refresco al volver del formulario.
- **Home:** balance del mes (ingresos, gastos, balance).
- **Categorías:** por defecto + crear/editar; selector de icono.
- **Presupuestos:** listado, alta, edición (categoría, límite mensual, % aviso). *La lógica de notificación se dejó para una siguiente iteración.*
- **Configuración:** idioma (es/en/pt), tema (claro/oscuro/sistema), toggle “Avisos de presupuesto” (guardado, sin lógica aún).
- **Base de datos:** IndexedDB/sql.js en web, SQLite en native; servicios y modelos listos.

---

## 2. Alcance propuesto para Fase 2

A partir del documento de Fase 1 y de la descripción de la app (“Registro de gastos, ingresos y **estadísticas**”), se propone que la Fase 2 cubra:

| # | Entregable | Descripción |
|---|------------|-------------|
| 1 | **Avisos de presupuesto** | Notificar (toast o alert) cuando el gasto de una categoría alcance o supere el % de aviso del presupuesto. Respetar el toggle de Configuración. |
| 2 | **Indicadores de presupuesto en listado** | En la lista de Presupuestos, mostrar por cada uno: gastado vs límite (barra o texto) y estado (bien / aviso / superado). |
| 3 | **Pantalla Estadísticas** | Nueva opción en Más → Estadísticas: vista con resumen por categoría (gastos del mes o periodo) y/o gráfico sencillo (barras o similar). |

---

## 3. Plan de trabajo (tareas en orden)

### Bloque A – Avisos de presupuesto

| Orden | Tarea | Detalle |
|-------|--------|---------|
| A1 | Servicio o lógica de avisos | Tras guardar un movimiento (o al abrir Explorar/Home), obtener presupuestos activos; para cada uno calcular gastado en el mes (BudgetService.getSpentInCategory); si gastado ≥ límite × (alertThresholdPercent/100) y no se avisó ya este mes, mostrar toast/alert. Respetar SettingsService (BUDGET_ALERTS_ENABLED). |
| A2 | Integrar aviso al guardar movimiento | Llamar a la lógica de avisos desde MovementPage después de create/update (y opcionalmente al cargar Explorar si se desea aviso al entrar). |
| A3 | Evitar spam | Guardar en Settings o en memoria qué presupuestos ya avisaron este mes (o esta sesión) para no repetir el mismo aviso. |

### Bloque B – Indicadores en listado de presupuestos

| Orden | Tarea | Detalle |
|-------|--------|---------|
| B1 | Gasto del mes por presupuesto | En BudgetsPage, al cargar, para cada presupuesto llamar a BudgetService.getSpentInCategory(categoryId, inicioMes, finMes). |
| B2 | Mostrar en la lista | Por cada ítem: “Gastado: X / Límite: Y” y una barra de progreso o color (verde &lt; aviso, naranja ≥ aviso, rojo ≥ límite). |
| B3 | i18n | Claves para “Gastado”, “Límite”, “Superado”, etc. |

### Bloque C – Pantalla Estadísticas

| Orden | Tarea | Detalle |
|-------|--------|---------|
| C1 | Ruta y entrada | Ruta `/statistics` (o `/stats`), lazy load; en Más añadir ítem “Estadísticas” que navegue a esa ruta. |
| C2 | Página Estadísticas | Título, selector de periodo (este mes / mes pasado / rango). Listado de categorías con gasto total en el periodo (usar MovementService o BudgetService.getSpentInCategory por categoría). |
| C3 | Opcional: gráfico | Gráfico de barras por categoría (con Chart.js, Angular Charts o CSS puro) para gastos del periodo. |
| C4 | i18n | Claves para “Estadísticas”, “Este mes”, “Mes pasado”, “Gasto por categoría”, etc. |

---

## 4. Orden de ejecución recomendado

1. **B1 y B2** – Indicadores en presupuestos (mejora visible y reutiliza lógica de gasto por categoría).
2. **A1, A2 y A3** – Avisos de presupuesto (usa la misma idea de gasto vs límite).
3. **C1, C2, C4** – Pantalla Estadísticas básica (listado por categoría).
4. **C3** – Gráfico (opcional, según tiempo).

---

## 5. Dependencias técnicas ya disponibles

- `BudgetService.getSpentInCategory(categoryId, dateFrom, dateTo)`.
- `SettingsService.getSetting/setSetting` y clave `BUDGET_ALERTS_ENABLED`.
- Modelo `Budget` con `amountLimit`, `alertThresholdPercent`, `categoryId`.
- Movimientos con `movement_date`, `category_id`, `type`, `amount`.

---

## 6. Criterios de aceptación (resumen)

- [ ] Al guardar un movimiento, si el gasto de esa categoría alcanza/supera el % de aviso del presupuesto y los avisos están activos, se muestra un aviso (toast o alert) y no se repite en exceso.
- [ ] En Más → Presupuestos, cada presupuesto muestra gastado vs límite y estado visual (bien/aviso/superado).
- [ ] En Más existe “Estadísticas”; al entrar se ve el gasto por categoría para el periodo elegido (al menos “este mes”).

Cuando estés de acuerdo con este alcance y orden, se puede ejecutar el plan tarea a tarea (empezando por el Bloque B).
