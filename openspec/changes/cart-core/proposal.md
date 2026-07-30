# Propuesta: cart-core

## Why

El backlog de producto (`docs/product-backlog.md`) define el loop mínimo para
validar la hipótesis de Carrito: registrar ítems y ver el total vivo. Las
historias de cámara/OCR (Épica 1) están bloqueadas por el spike de OCR (R1),
pero el carrito en sí, la entrada manual y la resiliencia de sesión no dependen
del OCR — y la entrada manual es además el rescate obligado si el OCR falla.
Construir este núcleo primero deja la base arquitectónica (estado, dinero,
persistencia) sobre la que se montan presupuesto y escaneo después.

## What Changes

- Estructura inicial de la app según `core/` + `features/` (reemplaza el
  skeleton "Hello world" del CLI).
- Estado del carrito como servicio root con signals (`CartStore`): ítems,
  total, contador; sin NgRx.
- Modelo de dinero en unidad menor entera (pesos COP, locale `es-CO`) con
  utilidades de parseo/formato centralizadas.
- Pantalla Inicio en sus dos estados: vacío (CTA único a cámara + acceso a
  entrada manual + placeholder de presupuesto futuro) y con ítems (total
  dominante, contador, lista de tarjetas con icono genérico, edición y
  eliminación de ítem).
- Pantalla Entrada manual con teclado numérico propio (pesos enteros, sin
  tecla decimal), nombre opcional, accesible desde el inicio.
- Persistencia de sesión en `localStorage` detrás de un adapter: restauración
  del carrito tras process death; sesión nueva arranca vacía.
- Routing lazy por feature (`home`, `manual-entry`) y shell mobile-first
  (layout responsive + manifest web estático). **Sin service worker en este
  change** (ver Impact).
- **BREAKING**: no aplica (proyecto en skeleton; se descarta el template de
  bienvenida de `src/app/app.html`).

## Capabilities

### New Capabilities

- `cart-management`: gestión del carrito de una sesión de compra — agregar
  ítems, visualizar total dominante y contador, listar tarjetas de producto
  (icono genérico, nombre, precio unitario, cantidad, subtotal), editar ítems
  con validación, eliminar ítems y estado vacío. Cubre CAR-2.1, CAR-2.2,
  CAR-2.3 y CAR-2.5 del backlog.
- `manual-entry`: alta manual de un ítem con teclado numérico propio, precio
  obligatorio en pesos enteros, nombre opcional, y acceso a esta pantalla
  desde el inicio (vacío o con ítems). Cubre CAR-4.1 y CAR-4.2 (alcance
  inicio; los caminos de error desde cámara/OCR van en el change de escaneo).
- `session-persistence`: recuperación del carrito y del estado de sesión si el
  SO cierra la app en segundo plano, y arranque en vacío cuando la sesión
  terminó. Cubre CAR-5.1 del backlog.

### Modified Capabilities

(ninguna — `openspec/specs/` está vacío; es el primer change del proyecto)

## Impact

- **Código**: reestructura de `src/app/` → `core/` (CartStore, money, storage
  adapter, modelos), `features/home`, `features/manual-entry`; `app.routes.ts`
  con rutas lazy; `app.html` pasa a ser solo el shell con `<router-outlet>`.
- **Dependencias**: ninguna nueva en runtime. El service worker / offline
  queda fuera de este change: requeriría `@angular/pwa` (dependencia nueva →
  aprobación explícita pendiente) y se propone para un change posterior.
  Manifest web se entrega como asset estático sin dependencias.
- **Restricciones del proyecto que aplican**: UI solo con ng-zorro + lucide +
  Tailwind; dinero y textos sin hardcodear (constantes/tokens); tests con
  cobertura real de la lógica (CartStore, money, persistencia); PWA/mobile-
  first con targets táctiles grandes (uso a una mano, DoD del backlog).
- **Fuera de alcance (queda explícito)**: presupuesto (change `budget`),
  cámara/OCR (change `scan-ocr`, gated por spike R1), vaciar carrito
  (CAR-2.4, va con `budget`), service worker/offline, historial y cualquier
  Won't del backlog.
