# Carrito — Backlog de producto (v1)

**Problema:** llevar la cuenta del gasto en el supermercado con la calculadora del
teléfono es lento y se pierde el detalle de lo que se lleva.
**Solución:** apuntar la cámara a la etiqueta del estante → OCR lee nombre y
precio → se agrega a la lista → total siempre visible.
**Usuario:** adulto con presupuesto definido, de pie en el pasillo, una sola mano
libre, con prisa.
**No es:** calculadora, comparador de precios, catálogo, ni app de finanzas.

**Restricciones v1:** sin backend, sin cuentas, sin historial, sin sincronización.
Un carrito = una sesión de compra. Cuatro pantallas: Inicio (vacío/con ítems),
Cámara, Confirmación de captura, Entrada manual.

**Hipótesis a validar:** escanear etiquetas con OCR y mantener un total vivo es
más rápido y confiable que la calculadora, al punto de que el usuario lo adopta
como hábito de compra.

---

## Épica 1 — Captura y escaneo (OCR)

### CAR-1.1 — Abrir cámara con permisos y guía (5 pts · Must)
> Como comprador quiero abrir la cámara desde el inicio para escanear la etiqueta sin fricción.

- **AC1 (camino feliz):** Dado que otorgué permiso de cámara, cuando toco "Escanear",
  entonces se abre la cámara con guía de encuadre y el total actual visible.
- **AC2 (permiso denegado):** Dado que negué el permiso, cuando intento abrir la
  cámara, entonces veo una explicación breve, un acceso a ajustes del sistema y la
  opción de continuar con entrada manual. No hay callejón sin salida.
- **AC3 (permiso "solo esta vez" / revocado):** Dado que el permiso fue revocado a
  mitad de sesión, cuando vuelvo a la cámara, entonces se vuelve a solicitar sin
  perder el carrito.

### CAR-1.2 — Extraer nombre y precio de la captura (8 pts · Must · depende del spike)
> Como comprador quiero que la app lea nombre y precio de la etiqueta para no tipear.

- **AC1:** Dada una foto de etiqueta con precio legible, cuando la capturo, entonces
  nombre y precio llegan precargados a la pantalla de confirmación en ≤ 2 s.
- **AC2 (etiqueta ambigua):** Dada una etiqueta con varios precios (ej. precio por
  kg y por unidad), cuando la capturo, entonces el sistema elige el precio principal
  y marca el campo como dudoso.
- **AC3 (límite):** Dado que el OCR no extrae nada, cuando la captura termina,
  entonces igual llego a confirmación con campos vacíos señalizados (ver CAR-1.4).

### CAR-1.3 — Confirmar ítem escaneado (5 pts · Must)
> Como comprador quiero revisar y corregir lo detectado antes de agregarlo para confiar en el total.

- **AC1:** Dada una captura procesada, cuando veo la confirmación, entonces nombre
  y precio son editables, la cantidad arranca en 1, y los campos con lectura dudosa
  están visualmente señalizados.
- **AC2 (loop de captura):** Dado que confirmo un ítem, cuando se agrega, entonces
  se actualiza el total y la app me ofrece seguir capturando sin pasar por el inicio.
- **AC3:** Dado que cancelo la confirmación, cuando vuelvo, entonces no se agrega
  nada y el carrito queda intacto.

### CAR-1.4 — Rescate cuando el OCR no lee el precio (3 pts · Must)
> Como comprador quiero completar el dato a mano cuando la lectura falla para no quedar trabado.

- **AC1:** Dado que el OCR no detectó precio, cuando llego a confirmación, entonces
  el campo precio está vacío, señalizado, con foco y teclado numérico; el botón
  confirmar permanece deshabilitado hasta ingresar un precio válido.
- **AC2:** Dado que el OCR no detectó nombre, cuando llego a confirmación, entonces
  puedo confirmar con el nombre vacío (el ítem se muestra con etiqueta genérica,
  ej. "Producto sin nombre").
- **AC3:** Dado que ingreso precio 0, negativo o texto no numérico, cuando intento
  confirmar, entonces el campo se marca inválido y no se agrega el ítem.

---

## Épica 2 — Carrito y total

### CAR-2.1 — Ver total dominante y lista de ítems (5 pts · Must)
> Como comprador quiero ver el total siempre y el detalle de lo que llevo para controlar mi gasto.

- **AC1:** Dado un carrito con ítems, cuando estoy en inicio, entonces el total es
  el elemento visual dominante, con contador de ítems y lista de tarjetas (icono
  genérico —nunca foto—, nombre, precio unitario, cantidad, subtotal).
- **AC2 (total siempre visible):** Dado un carrito con ítems, cuando navego a
  cámara o vuelvo, entonces el total sigue visible durante la captura y al regresar
  el carrito está intacto.
- **AC3 (consistencia):** Dado un carrito con N ítems, cuando edito o elimino,
  entonces total y contador se recalculan de inmediato.

### CAR-2.2 — Editar ítem (3 pts · Must)
> Como comprador quiero corregir nombre, precio o cantidad de un ítem para que el total refleje la realidad.

- **AC1:** Dado un ítem en la lista, cuando edito cualquier campo con valores
  válidos, entonces se guarda y se recalcula subtotal y total.
- **AC2 (valores inválidos):** Dado un ítem, cuando ingreso precio 0, negativo,
  cantidad 0 o negativa, o texto en campo numérico, entonces el campo se marca
  inválido y el cambio no se aplica.

### CAR-2.3 — Eliminar ítem (3 pts · Must)
> Como comprador quiero quitar un ítem que no voy a comprar para mantener el total correcto.

- **AC1:** Dado un ítem, cuando lo elimino, entonces desaparece de la lista y el
  total se actualiza.
- **AC2 (borde):** Dado el último ítem del carrito, cuando lo elimino, entonces
  vuelvo al estado de inicio vacío (el presupuesto definido se conserva).

### CAR-2.4 — Vaciar carrito completo (2 pts · Should)
> Como comprador quiero vaciar todo de una vez para empezar una nueva compra.

- **AC1:** Dado un carrito con ítems, cuando elijo "Vaciar carrito", entonces se
  pide confirmación explícita antes de borrar.
- **AC2:** Dado que confirmo el vaciado, cuando se ejecuta, entonces la lista queda
  vacía, el total vuelve a 0 y no hay forma de recuperar los ítems (no hay
  historial en v1).

### CAR-2.5 — Estado vacío (2 pts · Must)
> Como comprador quiero un inicio claro cuando no tengo nada cargado para saber qué hacer.

- **AC1:** Dado el carrito vacío, cuando entro al inicio, entonces veo una única
  acción principal (abrir cámara), acceso a entrada manual y la opción de definir
  presupuesto.
- **AC2:** Dado el carrito vacío, cuando miro la pantalla, entonces no aparecen
  barra de progreso, contador ni lista (sin ruido visual).

---

## Épica 3 — Presupuesto

### CAR-3.1 — Definir presupuesto opcional (3 pts · Should)
> Como comprador con presupuesto quiero fijar un tope antes de empezar para comprar con tranquilidad.

- **AC1:** Dado el inicio vacío, cuando defino un presupuesto válido (> 0),
  entonces queda guardado para la sesión y se muestra en el inicio con ítems.
- **AC2 (inválido):** Dado el campo presupuesto, cuando ingreso 0, negativo o texto,
  entonces se marca inválido y no se guarda.
- **AC3:** Dado un presupuesto definido, cuando quiero cambiarlo o quitarlo a mitad
  de compra, entonces puedo hacerlo sin perder los ítems.

### CAR-3.2 — Progreso y alerta de presupuesto excedido (5 pts · Should)
> Como comprador quiero ver cuánto me queda para no pasarme del tope.

- **AC1:** Dado un presupuesto definido y un carrito con ítems, cuando estoy en
  inicio, entonces veo barra de progreso y monto restante.
- **AC2 (excedido):** Dado que el total supera el presupuesto, cuando se actualiza,
  entonces la barra y el restante señalan el exceso con el monto negativo (ej.
  "te pasaste $ 350"). **Regla de negocio:** la alerta nunca bloquea seguir
  agregando ítems.
- **AC3 (borde exacto):** Dado que el total iguala exactamente el presupuesto,
  cuando se muestra, entonces el restante es 0 sin marcarse como excedido.

---

## Épica 4 — Entrada manual

### CAR-4.1 — Agregar ítem manualmente (3 pts · Must)
> Como comprador quiero cargar un ítem a mano cuando la cámara no es viable para no abandonar el registro.

- **AC1:** Dado que abro la entrada manual, cuando completo, entonces puedo agregar
  con solo precio (nombre opcional) usando un teclado numérico propio.
- **AC2 (inválidos):** Dado el formulario manual, cuando ingreso precio 0, negativo
  o vacío, entonces confirmar está deshabilitado / el campo se marca inválido.

### CAR-4.2 — Acceso a entrada manual (2 pts · Must)
> Como comprador quiero llegar a la entrada manual desde cualquier punto de fallo para siempre tener alternativa.

- **AC1:** Dado el inicio (vacío o con ítems), cuando busco la alternativa, entonces
  la entrada manual está accesible con una mano.
- **AC2:** Dado un permiso denegado o una lectura OCR fallida, cuando estoy en ese
  estado de error, entonces hay un camino directo a la entrada manual.

---

## Épica 5 — Resiliencia de sesión

### CAR-5.1 — Recuperar el carrito si el sistema cierra la app (5 pts · Must)
> Como comprador quiero recuperar mi carrito si el SO mata la app en segundo plano para no perder toda la compra.

- **AC1:** Dado un carrito con ítems, cuando el SO cierra la app en segundo plano
  (process death) y la vuelvo a abrir, entonces se restauran ítems, total y
  presupuesto de la sesión.
- **AC2 (interpretación de restricción):** "Sin base de datos" se interpreta como
  sin backend/DB remota; la persistencia local en el dispositivo es la vía esperada
  para cumplir AC1. (Supuesto — ver §11.)
- **AC3 (sesión nueva):** Dado que vacié el carrito o terminé la compra, cuando
  reabro la app, entonces arranca en inicio vacío (no hay historial).

---

## Priorización MoSCoW

| Grupo | Historias | Puntos | Justificación |
|---|---|---|---|
| **Must** | 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.5, 4.1, 4.2, 5.1 | 42 | El loop completo escanear → confirmar → total, con rescate manual y sin pérdida de estado. Es lo mínimo para validar la hipótesis. |
| **Should** | 3.1, 3.2, 2.4 | 10 | Presupuesto y vaciado: alto valor percibido, pero la hipótesis (OCR + total vivo) se valida sin ellos. Si negocio considera el presupuesto parte de la hipótesis, suben a Must sin rediseño. |
| **Could** | Deshacer al eliminar ítem; mantener pantalla encendida; feedback háptico al agregar; recordar último presupuesto entre sesiones | — | Pulido si sobra capacidad. |
| **Won't (v1)** | Historial, sincronización, cuentas, catálogo, comparador, fotos de producto, escaneo de código de barras, motor de impuestos, productos por peso, motor de promociones | — | Fuera del posicionamiento y de las restricciones. |

**Secuencia sugerida:** Spike OCR (§10) → Must de Épica 1 + 2 + 5 → Épica 4 →
Should de Épica 3 → Could.

---

## Definición de Listo (DoR)

Una historia está lista para entrar a desarrollo cuando:

1. Tiene criterios de aceptación Given/When/Then con errores y bordes incluidos.
2. El flujo de la pantalla está definido (de las 4 pantallas acordadas) y revisado.
3. Está estimada en puntos por el equipo.
4. Sus dependencias están resueltas o identificadas (toda historia de Épica 1
   depende del criterio go/no-go del spike OCR, §10).
5. Los eventos de métricas que debe emitir están listados (§9).
6. No tiene preguntas abiertas bloqueantes sin respuesta (§12).

## Definición de Terminado (DoD)

Una historia está terminada cuando:

1. Todos sus AC pasan, incluidos errores y bordes, verificados en **dispositivo
   real de gama media** (no solo emulador).
2. La lógica de negocio (cálculo de total, validaciones, persistencia de sesión)
   tiene tests automatizados.
3. Emite los eventos de métricas definidos.
4. Es usable con una sola mano: objetivos táctiles grandes, acciones principales al
   alcance del pulgar, contraste legible bajo luz de supermercado.
5. CAR-5.1 se verifica simulando process death (modo desarrollador).
6. Sin crashes ni pérdida de datos conocidos; revisión de PO realizada.

---

## Métricas de éxito (instrumentación local, sin backend)

| Métrica | Fórmula | Objetivo inicial* |
|---|---|---|
| **Precisión OCR al primer intento** | capturas confirmadas sin editar ningún campo / total de capturas | ≥ 70 % |
| **Tasa de corrección manual** | capturas donde el usuario edita ≥ 1 campo / total de capturas (desagregar: precio vs. nombre) | ≤ 40 %; precio ≤ 25 % |
| **Tiempo cámara → ítem agregado** | desde abrir cámara hasta confirmar ítem (mediana y p90) | p50 ≤ 6 s · p90 ≤ 12 s |
| **Participación de entrada manual** | ítems por entrada manual / total de ítems agregados | ≤ 30 % (si supera 50 %, el OCR está fallando como propuesta de valor) |
| **Comparación contra calculadora** | tiempo por ítem vs. línea base medida en test con usuarios | ≥ 40 % más rápido |

\* Objetivos iniciales a calibrar con los resultados del spike y el primer test de
usabilidad. Son supuestos de negocio, no compromisos.

---

## Riesgos y supuestos

### Riesgos

1. **R1 — Confiabilidad del OCR sobre etiquetas reales (principal).** Etiquetas con
   tipografías raras, curvadas, plastificadas con reflejos, múltiples precios,
   formatos `$ 1.299,99` vs `1299.99`. Si la precisión real es baja, la entrada
   manual se vuelve el flujo principal y la hipótesis muere.
   **Validación ANTES de construir el resto (spike, 1–2 semanas):**
   - Relevar 150–200 fotos de etiquetas reales de al menos 3 cadenas de
     supermercados del mercado objetivo.
   - Probar los motores OCR candidatos sobre ese set y medir: % con precio
     extraído correcto y % con nombre+precio correctos.
   - **Criterio go/no-go acordado de antemano:** si precio correcto ≥ 70 % sin
     asistencia → se construyen las épicas 2–5; si está entre 50–70 % → se
     rediseña la confirmación para corrección rápida y se reevalúa; si < 50 % →
     no-go de la v1 tal como está planteada.
   - Entregable del spike: informe de precisión + demo captura → confirmación.
2. **R2 — Variabilidad de etiquetas** (precio por kg, "2x5", promos). v1 trata
   toda etiqueta como precio simple; el usuario corrige a mano. Mitigado por
   CAR-1.3/1.4, depende de decisiones en §12.
3. **R3 — Permiso de cámara denegado de forma permanente.** Mitigado con CAR-1.1
   AC2/AC3 y entrada manual siempre accesible.
4. **R4 — Pérdida de estado por process death.** Mitigado con CAR-5.1; sin esto,
   una compra de 30 ítems perdida destruye la confianza en el producto.
5. **R5 — Usabilidad a una mano con prisa.** Validar con test de guerrilla: 5
   usuarios en supermercado real, midiendo tiempo por ítem contra calculadora.

### Supuestos (no verificados, tratar como tales)

- **S1:** Los precios de góndola del mercado objetivo son finales (impuestos
  incluidos).
- **S2:** Una sola moneda y un solo formato de precio en v1.
- **S3:** El usuario escanea una etiqueta = un producto; las cantidades se ajustan
  editando el ítem.
- **S4:** El procesamiento OCR ocurre en el dispositivo (no hay backend; la
  conectividad dentro del supermercado no es confiable).
- **S5:** "Sin base de datos" = sin DB remota ni cuentas; se permite persistencia
  local en el dispositivo para cumplir CAR-5.1.
- **S6:** Una foto de etiqueta no se almacena ni sale del dispositivo (privacidad).

---

## Preguntas abiertas (requieren decisión de negocio antes de desarrollar)

1. **Impuestos:** ¿los precios de góndola incluyen impuestos en el mercado
   objetivo? (Supuesto S1: sí. Si no, el total deja de coincidir con la caja y hay
   que repensar el alcance.)
2. **Productos por peso** (verdulería, carnicería): ¿confirmado fuera de v1? La
   etiqueta por kg no permite calcular subtotal sin ingresar el peso.
3. **Promociones** (2x1, 50 % en 2.ª unidad, precio por mayor): ¿v1 las ignora y
   el usuario ajusta precio/cantidad a mano?
4. **Moneda y formato:** ¿mercado único? ¿Separador decimal `,` o `.`? Impacta el
   parsing del OCR y el teclado numérico.
5. **Conectividad:** ¿la app debe funcionar 100 % offline (OCR en dispositivo) o se
   acepta OCR que requiera conexión? Decisión de producto con impacto en privacidad
   y en la promesa de uso dentro del supermercado.
6. **Nombre opcional:** cuando el OCR no lee el nombre, ¿se permite confirmar sin
   nombre (etiqueta genérica) o se exige cargarlo? (Propuesta PO: opcional — el
   precio es lo crítico para el total.)
7. **Fin de sesión:** ¿"vaciar carrito" es la única forma de terminar la compra, o
   se quiere una acción "Finalizar compra" (sin historial, solo reset)?

---

## Notas de handoff para el Frontend Architect

- Alcance cerrado: 4 pantallas, sin backend ni cuentas; persistencia local sí (S5).
- Flujos críticos: loop de captura continua (CAR-1.3 AC2), total visible durante
  captura (CAR-2.1 AC2), recuperación de sesión (CAR-5.1).
- Reglas de negocio duras: alerta de presupuesto nunca bloquea (CAR-3.2 AC2); sin
  fotos de producto, solo icono genérico (CAR-2.1 AC1); sin historial bajo ninguna
  forma (Won't).
- Las historias de Épica 1 no arrancan hasta el go/no-go del spike OCR (R1).
- Decisiones pendientes que condicionan implementación: §12 (formato de moneda,
  offline vs. conexión, nombre opcional).
