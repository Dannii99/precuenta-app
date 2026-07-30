# Spec: manual-entry

## ADDED Requirements

### Requirement: Alta manual de ítem

El sistema SHALL permitir agregar un ítem al carrito ingresando solo el precio
(nombre opcional) mediante un teclado numérico propio que acepta únicamente
dígitos (pesos enteros, sin decimales). El ítem se agrega con cantidad
inicial 1.

#### Scenario: Alta con solo precio

- **WHEN** el usuario ingresa un precio válido (entero > 0) y confirma sin
  cargar nombre
- **THEN** el ítem se agrega al carrito con cantidad 1, el total se actualiza
  y el usuario regresa al inicio

#### Scenario: Alta con nombre

- **WHEN** el usuario ingresa precio válido y un nombre, y confirma
- **THEN** el ítem se agrega al carrito con ese nombre y cantidad 1

#### Scenario: Teclado solo dígitos

- **WHEN** el usuario interactúa con el teclado numérico propio
- **THEN** solo puede ingresar dígitos, sin separador decimal ni otros
  caracteres

### Requirement: Validación de la entrada manual

El sistema MUST impedir confirmar la entrada manual con precio vacío, igual a
cero o negativo.

#### Scenario: Precio vacío

- **WHEN** el usuario intenta confirmar sin haber ingresado precio
- **THEN** la acción de confirmar permanece deshabilitada

#### Scenario: Precio cero o negativo

- **WHEN** el usuario ingresa un precio igual a 0
- **THEN** el campo se marca inválido y no se agrega el ítem

### Requirement: Acceso a la entrada manual

El sistema SHALL ofrecer acceso a la entrada manual desde el inicio, tanto con
el carrito vacío como con ítems, con un objetivo táctil usable con una mano.

#### Scenario: Acceso desde inicio vacío

- **WHEN** el usuario está en el inicio con el carrito vacío
- **THEN** encuentra el acceso a la entrada manual visible y accionable

#### Scenario: Acceso desde inicio con ítems

- **WHEN** el usuario está en el inicio con ítems en el carrito
- **THEN** encuentra el acceso a la entrada manual visible y accionable
