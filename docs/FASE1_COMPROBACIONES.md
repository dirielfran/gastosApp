# Fase 1 – Paso a paso para comprobar que todo funcione bien

Sigue estos pasos en orden. Usa la app en el navegador (`ng serve`) o en emulador.

---

## 1. Arranque y pestañas

1. Abre la app (por ejemplo `http://localhost:4200`).
2. **Comprueba:** La URL debe ser `.../tabs/home` y debes ver **tres pestañas abajo**: **Inicio**, **Explorar**, **Más**.
3. Pulsa **Explorar** y luego **Más**. La navegación entre pestañas debe funcionar sin errores.

---

## 2. Cuentas (registro de cuentas)

1. Pestaña **Más** → **Cuentas**.
2. **Comprueba:** Listado vacío con texto tipo “No hay cuentas. Añade una para empezar” y botón **Añadir**.
3. Pulsa el **+** (o “Añadir”) → pantalla “Nueva cuenta”.
4. Rellena **Nombre** (ej. “Efectivo”) y **Moneda** (ej. EUR). Guardar.
5. **Comprueba:** Vuelves al listado y aparece la cuenta con balance 0,00 € (o el formato de la moneda).
6. Pulsa la cuenta → “Editar cuenta”. Cambia el nombre y guarda. **Comprueba:** El cambio se ve en el listado.
7. Crea una segunda cuenta (ej. “Banco”, USD). **Comprueba:** Ambas aparecen en el listado.


---

## 3. Movimientos (gastos e ingresos)

1. Pestaña **Explorar**.
2. **Comprueba:** Sin movimientos verás “No hay movimientos...” y un botón **Añadir**; abajo a la derecha un **FAB (+)**.
3. Pulsa el **+** → “Nuevo movimiento”.
4. Elige **Tipo** (Gasto / Ingreso), **Cuenta**, **Categoría**, **Importe**, **Fecha**, **Nota** (opcional). Guardar.
5. **Comprueba:** Vuelves a Explorar y el movimiento aparece en la lista (categoría, fecha, tipo, importe con + o -).
Nota: los movimientos aparecen cuando sales de la lista y vuelves
6. Pulsa un movimiento → “Editar movimiento”. Cambia importe o categoría y guarda. **Comprueba:** Se actualiza en la lista.
Nota: la edicion de  movimientos aparecen cuando sales de la lista y vuelves
7. Añade al menos un **ingreso** y un **gasto** en el mes actual (misma fecha o rango que “este mes”).
Nota:  movimientos aparecen cuando sales de la lista y vuelves

---

## 4. Home – Balance del mes

1. Pestaña **Inicio**.
2. **Comprueba:** La tarjeta “Balance” muestra **Este mes** con:
   - **Ingresos:** suma de los ingresos del mes.
   - **Gastos:** suma de los gastos del mes.
   - **Balance:** ingresos − gastos.
3. Si no hay movimientos, los tres pueden ser 0,00 €. Si añadiste ingreso y gasto, las cifras deben cuadrar con lo que ves en Explorar.

---

## 5. Categorías (lista por defecto + crear/editar)

1. **Más** → **Categorías**.
2. **Comprueba:** Aparecen las **categorías por defecto** (Comida, Transporte, Ocio, Salud, etc.) con icono y color.
3. Pulsa **+** → “Nueva categoría”. Nombre (ej. “Supermercado”), color. Guardar.
4. **Comprueba:** La nueva categoría aparece en el listado.
5. Pulsa una categoría (por defecto o la nueva) → “Editar categoría”. Cambia nombre o color y guarda. **Comprueba:** Se actualiza en el listado.
6. En “Nuevo movimiento”, **comprueba** que en **Categoría** salen tanto las por defecto como la que creaste.

---

## 6. Presupuestos

1. **Más** → **Presupuestos**.
2. **Comprueba:** Listado vacío con opción de añadir.
3. Pulsa **+** → “Nuevo presupuesto”. Elige **Categoría**, **Límite mensual** (ej. 500), **Aviso al %** (ej. 80). Guardar.
4. **Comprueba:** El presupuesto aparece en el listado con categoría, límite y % de aviso.
5. Edita el presupuesto (por ejemplo cambia el límite). **Comprueba:** El cambio se refleja en el listado.

---

## 7. Configuración

1. **Más** → **Configuración**.
2. **Idioma:** Cambia a English (o Português). **Comprueba:** Los textos de la app cambian (tabs, botones, etiquetas).
3. **Tema:** Cambia a **Claro** / **Oscuro** / **Según sistema**. **Comprueba:** El tema de la app cambia.
4. **Avisos de presupuesto:** Activa/desactiva el toggle. **Comprueba:** No da error (la opción se guarda para uso futuro).

---

## 8. Resumen rápido (checklist)

| Paso | Qué comprobar |
|------|----------------|
| 1 | Tabs Inicio / Explorar / Más y navegación entre ellas. |
| 2 | Cuentas: listar, crear, editar; ver balance por cuenta. |
| 3 | Movimientos: listar, crear (gasto/ingreso), editar; FAB y navegación a formulario. |
| 4 | Inicio: tarjeta Balance con Ingresos, Gastos y Balance del mes. |
| 5 | Categorías: listado por defecto + crear y editar; usarlas en movimientos. |
| 6 | Presupuestos: crear y editar por categoría (límite y % aviso). |
| 7 | Configuración: idioma (es/en/pt), tema, avisos de presupuesto. |

Si todo lo anterior se cumple, la Fase 1 está funcionando correctamente. Para **avisos de presupuesto** (aviso al acercarse al límite) la lógica de notificación se puede añadir en una siguiente iteración; la opción en Configuración ya está guardada.
