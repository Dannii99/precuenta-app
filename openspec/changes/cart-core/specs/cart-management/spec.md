# Spec: cart-management

## ADDED Requirements

### Requirement: Total dominante y contador de ítems

El sistema SHALL mostrar en el inicio, cuando el carrito tiene ítems, el total
del carrito como elemento visual dominante y siempre visible, junto con el
contador de ítems. El total SHALL calcularse como la suma exacta de los
subtotales (precio unitario × cantidad) usando aritmética entera en pesos COP.

#### Scenario: Visualización con ítems

- **WHEN** el usuario está en el inicio y el carrito tiene al menos un ítem
- **THEN** el total del carrito es el elemento visual dominante de la pantalla
  y se muestra el contador de ítems

#### Scenario: Recálculo inmediato

- **WHEN** el usuario edita o elimina un ítem del carrito
- **THEN** el total y el contador se recalculan y actualizan de inmediato

#### Scenario: Formato de moneda

- **WHEN** el sistema muestra cualquier monto (precio, subtotal, total)
- **THEN** el monto se formatea en locale es-CO con moneda COP y sin decimales
  (ej. `$ 12.900`)

### Requirement: Lista de tarjetas de producto

El sistema SHALL mostrar cada ítem del carrito como una tarjeta con un icono
genérico de producto (nunca una foto), nombre, precio unitario, cantidad y
subtotal. Un ítem sin nombre SHALL mostrarse con una etiqueta genérica (ej.
"Producto sin nombre").

#### Scenario: Contenido de la tarjeta

- **WHEN** el carrito tiene ítems y el usuario ve la lista
- **THEN** cada tarjeta muestra icono genérico, nombre, precio unitario,
  cantidad y subtotal, sin fotos de producto

#### Scenario: Ítem sin nombre

- **WHEN** un ítem del carrito no tiene nombre cargado
- **THEN** la tarjeta lo muestra con la etiqueta genérica definida en las
  constantes de la feature

### Requirement: Edición de ítem con validación

El sistema SHALL permitir editar nombre, precio y cantidad de cualquier ítem
del carrito. El sistema MUST rechazar precios menores o iguales a cero,
cantidades menores a 1, y valores no numéricos en campos numéricos, sin
aplicar el cambio.

#### Scenario: Edición válida

- **WHEN** el usuario edita un ítem con valores válidos (precio entero > 0,
  cantidad entera ≥ 1)
- **THEN** el cambio se guarda y se recalculan el subtotal del ítem y el total
  del carrito

#### Scenario: Precio inválido

- **WHEN** el usuario ingresa precio 0, negativo o no numérico al editar
- **THEN** el campo se marca inválido y el cambio no se aplica

#### Scenario: Cantidad inválida

- **WHEN** el usuario ingresa cantidad 0, negativa o no numérica al editar
- **THEN** el campo se marca inválido y el cambio no se aplica

### Requirement: Eliminación de ítem

El sistema SHALL permitir eliminar cualquier ítem del carrito, actualizando el
total de inmediato.

#### Scenario: Eliminación estándar

- **WHEN** el usuario elimina un ítem del carrito
- **THEN** el ítem desaparece de la lista y el total se actualiza

#### Scenario: Eliminación del último ítem

- **WHEN** el usuario elimina el último ítem del carrito
- **THEN** el inicio vuelve al estado vacío

### Requirement: Estado vacío

El sistema SHALL mostrar en el inicio, cuando el carrito está vacío, una única
acción principal (abrir la cámara), un acceso a la entrada manual y la opción
de definir presupuesto, sin mostrar contador, lista ni barra de progreso. La
acción de cámara SHALL presentarse como no disponible hasta que exista la
capacidad de escaneo.

#### Scenario: Inicio limpio

- **WHEN** el usuario entra al inicio con el carrito vacío
- **THEN** ve una única acción principal de cámara, el acceso a entrada manual
  y la opción de presupuesto, sin contador ni lista

#### Scenario: Cámara no disponible aún

- **WHEN** el usuario intenta usar la acción de cámara en este change
- **THEN** el sistema indica que la función estará disponible próximamente sin
  romper la navegación ni perder el estado del carrito
