# Diseño: cart-core

## Context

Proyecto Angular 21 zoneless (sin `zone.js` en dependencias) en estado skeleton:
solo el template de bienvenida del CLI, `provideRouter` configurado con rutas
vacías, ng-zorro + Tailwind 4 + lucide instalados. El backlog
(`docs/product-backlog.md`) define el alcance funcional y sus casos borde.
Decisiones de producto ya confirmadas: **PWA mobile-first**, **moneda COP con
locale `es-CO`** (precios en pesos enteros, CLDR: COP con 0 decimales), y
este change como primer corte (sin presupuesto ni cámara).

## Goals / Non-Goals

**Goals:**

- Base arquitectónica del proyecto: `core/` + `features/`, lazy routes, OnPush
  + signals en todo componente (zoneless).
- Carrito funcional de una sesión: alta manual, total vivo, edición, borrado,
  estado vacío.
- Cero pérdida de estado ante process death (CAR-5.1) vía `localStorage`.
- Modelo de dinero exacto y centralizado, listo para que `budget` y `scan-ocr`
  se monten encima sin migraciones.

**Non-Goals:**

- Presupuesto (change `budget`), cámara/OCR (change `scan-ocr`, gated por
  spike R1), vaciar carrito (CAR-2.4, va con `budget`).
- Service worker / offline / instalabilidad real: requiere `@angular/pwa`
  (dependencia nueva, aprobación pendiente). Este change solo deja el manifest
  web estático y el layout mobile-first.
- Deshacer al eliminar, hápticos, mantener pantalla encendida (Could del
  backlog).
- E2E con Playwright (herramienta no instalada; ver Open Questions).

## Decisions

### 1. Estructura `core/` + `features/` con lazy routes

```
src/app/
├── core/
│   ├── cart/            # CartStore (estado de sesión)
│   ├── money/           # tipo y utilidades de dinero
│   ├── storage/         # StoragePort + adapter localStorage
│   └── metrics/         # MetricsService (eventos locales)
├── features/
│   ├── home/            # Inicio (vacío y con ítems) — ruta '/'
│   └── manual-entry/    # Entrada manual — ruta '/manual'
└── app.routes.ts        # lazy loadChildren por feature
```

Cada feature es una ruta lazy para no inflar el bundle inicial. `shared/` no
se crea hasta que exista un segundo consumidor real (regla de la skill).

### 2. Estado: `CartStore` con signals, sin NgRx

Servicio `providedIn: 'root'`: signal privada writable con el estado
(`items`, `budget: null` reservado para el change futuro), exposición
`asReadonly()`, y `computed()` para `total`, `itemCount` y subtotales.
Ningún criterio de escalación a store aplica (un solo agregado, una sesión,
sin undo/redo Must, sin máquina de estados compleja). Mutaciones como métodos
del store (`addItem`, `updateItem`, `removeItem`) — la UI nunca escribe la
signal directamente. El campo `budget` ya existe en el estado persistido
(siempre `null` en este change) para que `budget` no requiera migración.

### 3. Dinero en unidad menor entera, formato solo en la vista

Tipo `COP` = entero de pesos (la unidad menor de COP en la práctica es el
peso; no hay centavos en circulación). Toda la lógica (sumas, subtotales,
total) opera con enteros — jamás floats. Parseo y formato centralizados en
`core/money/` (locale `es-CO`, moneda `COP`, 0 decimales vía pipe de Angular o
`Intl.NumberFormat`); ningún componente formatea por su cuenta. Textos y
etiquetas en constantes de la feature (regla del proyecto: sin magic strings).

### 4. Persistencia: `StoragePort` + adapter `localStorage`, write-through

Interfaz `StoragePort` (`load`/`save`/`clear`) con implementación
`LocalStorageAdapter`. El `CartStore` se hidrata al construirse leyendo el
payload versionado (`{ v: 1, items, budget }`), y persiste en cada mutación
(write-through vía `effect()`) sin acción del usuario. Al leer, se valida el
schema: payload corrupto, versión desconocida o datos inválidos → carrito
vacío (nunca restaurar basura ni crashear). Storage es un límite externo → se
mockea en tests; si mañana migra a IndexedDB el cambio es localizado al
adapter.

### 5. Forms: Reactive Forms

Edición de ítem y entrada manual usan Reactive Forms con validadores
(`precio > 0` entero, `cantidad >= 1` entera). Signal Forms es developer
preview en Angular 21 → descartado para producción. Template-driven no cubre
la validación requerida.

### 6. UI: ng-zorro para lo que existe, custom solo lo que no existe

- Tarjetas de producto sobre `nz-card`; botones `nz-button`; iconos
  `@lucide/angular`; inputs de ng-zorro integrados a Reactive Forms.
- Edición de ítem en `nz-modal` (full-screen en móvil) con el Reactive Form.
- Eliminación directa (el backlog no pide confirmación para ítem individual).
- **Teclado numérico propio** (feature `manual-entry`): no existe en ng-zorro
  → componente custom de la feature, solo dígitos (pesos enteros, sin tecla
  decimal). Campos de edición usan `inputmode="numeric"`.
- Layout y espaciado con Tailwind; colores/espaciado desde tokens
  (`theme.less`/Tailwind), nada hardcodeado.
- Mobile-first una mano: acciones principales ancladas abajo al alcance del
  pulgar, targets táctiles ≥ 44px, total dominante siempre visible arriba.

### 7. Métricas locales: `MetricsService` en `core/`

El DoD del backlog exige emitir eventos. Sin backend: `MetricsService` appenda
eventos tipados (`item_added{source}`, `item_edited`, `item_deleted`,
`cart_restored`, `session_started`) a una cola acotada (últimos ~200) en
`localStorage`, key separada del carrito. Las métricas OCR del §9 aplican solo
al change `scan-ocr`.

### 8. Testing según política de la skill

- **Full**: `CartStore` (cálculo, mutaciones, hidratación, write-through,
  payload corrupto), `core/money` (parseo/formato/es-CO), validadores.
- **Smoke**: componentes de presentación (tarjeta, keypad).
- **Mocks solo en límites**: `StoragePort`. Nunca servicios propios.

## Risks / Trade-offs

- **Datos corruptos en `localStorage`** (edición manual, versión vieja) →
  validación de schema al hidratar + fallback a carrito vacío (Decisión 4).
- **Que alguien introduzca floats para dinero más adelante** → tipo y
  utilidades centralizadas; revisión en auditoría de código de cada change.
- **Teclado custom inconsistente con el nativo del SO** → alcance limitado a
  `manual-entry` (lo pide el backlog); edición usa teclado del SO con
  `inputmode="numeric"`.
- **Service worker diferido** → la app no es offline-instalable todavía; la
  recuperación de sesión (CAR-5.1) no depende del SW, así que el riesgo de
  producto cubierto por este change no se afecta.
- **`budget: null` en el schema persistido** → ligero acoplamiento forward,
  aceptado a cambio de cero migración en el próximo change.

## Migration Plan

Proyecto en skeleton, sin usuarios ni datos: no aplica. El template de
bienvenida de `app.html` se descarta.

## Open Questions

1. ¿Se aprueba `@angular/pwa` para un change posterior de offline/installable?
2. ¿Se instala Playwright para el golden path "agregar → total → persiste tras
   recarga" cuando haya más flujo, o se cubre solo con tests unitarios?
3. Tras agregar por entrada manual, ¿volver al inicio (asumido en specs) u
   ofrecer "agregar otro"? Decisión de UX menor, ajustable sin rediseño.
