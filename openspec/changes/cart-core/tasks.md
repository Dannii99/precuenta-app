# Tasks: cart-core

Referencia: `proposal.md` (alcance), `design.md` (cómo), `specs/` (qué).

## 1. Core: dinero, storage y métricas

- [x] 1.1 Crear `core/money/`: tipo de dinero en pesos enteros COP, funciones de subtotal/suma, parseo y formato `es-CO`/COP sin decimales (centralizado, sin formato suelto en componentes), con tests completos
- [x] 1.2 Crear `core/storage/`: interfaz `StoragePort` (load/save/clear) + `LocalStorageAdapter`, con tests del adapter
- [x] 1.3 Crear `core/metrics/MetricsService`: eventos tipados (`item_added{source}`, `item_edited`, `item_deleted`, `cart_restored`, `session_started`) en cola acotada (~200) en localStorage, key separada del carrito, con tests

## 2. Core: CartStore

- [x] 2.1 Definir modelo `CartItem` (id, nombre opcional, precio, cantidad) y schema persistido versionado `{ v: 1, items, budget: null }`
- [x] 2.2 Implementar `CartStore` (root, zoneless-friendly): signal privada, exposición `asReadonly()`, `computed()` de total e itemCount, mutaciones `addItem` / `updateItem` / `removeItem`
- [x] 2.3 Hidratación al construirse con validación de schema (payload corrupto o versión desconocida → estado vacío sin error) + write-through con `effect()` en cada mutación
- [x] 2.4 Tests completos del store: cálculo exacto del total, mutaciones, hidratación, payload corrupto, write-through (mockeando solo `StoragePort`)

## 3. Shell, routing y manifest

- [x] 3.1 Configurar rutas lazy `/` → `features/home` y `/manual` → `features/manual-entry` en `app.routes.ts`
- [x] 3.2 Dejar `app.html` como shell puro con `<router-outlet>` (retirar el "Hello world")
- [x] 3.3 Agregar manifest web estático (asset en `public/`) + meta viewport y `theme-color` en `index.html` — sin service worker
- [x] 3.4 Centralizar textos/etiquetas de la app en constantes (incl. etiqueta genérica "Producto sin nombre")

## 4. Feature: home (cart-management)

- [x] 4.1 Estado vacío: única acción principal de cámara mostrada como no disponible ("próximamente", sin romper navegación), acceso visible a entrada manual y placeholder de presupuesto; sin contador ni lista
- [x] 4.2 Estado con ítems: total dominante siempre visible + contador, con formato de `core/money`
- [x] 4.3 Tarjeta de producto (nz-card + icono lucide genérico, nunca foto): nombre o etiqueta genérica, precio unitario, cantidad y subtotal
- [x] 4.4 Eliminación directa de ítem con actualización inmediata del total; al eliminar el último ítem vuelve al estado vacío
- [x] 4.5 Edición en `nz-modal` con Reactive Form: precio entero > 0 y cantidad entera ≥ 1; valores inválidos marcan el campo y no aplican el cambio
- [ ] 4.6 Tests: smoke de tarjeta y home; completos de cualquier lógica condicional del componente

## 5. Feature: manual-entry

- [x] 5.1 Teclado numérico propio (solo dígitos, sin tecla decimal) como componente privado de la feature, usable con una mano (targets ≥ 44px)
- [x] 5.2 Formulario Reactive: precio obligatorio entero > 0 (confirmar deshabilitado con precio vacío o 0), nombre opcional
- [x] 5.3 Flujo de confirmación: agrega el ítem con cantidad 1, actualiza el total y regresa al inicio
- [ ] 5.4 Tests: validaciones del formulario (completos) + smoke del teclado

## 6. Verificación de cierre

- [ ] 6.1 Recorrer todos los scenarios de los 3 specs contra la app corriendo (`npm start`)
- [ ] 6.2 Simular process death (cerrar y reabrir la app) y verificar restauración íntegra del carrito
- [x] 6.3 `npm test` en verde y `npm run build` en verde sin exceder budget
- [ ] 6.4 Chequeo a11y: targets táctiles ≥ 44px, acciones principales al alcance del pulgar, contraste legible, foco visible en el modal
- [ ] 6.5 Verificar emisión de eventos de métricas en los flujos (agregar, editar, eliminar, restaurar)
