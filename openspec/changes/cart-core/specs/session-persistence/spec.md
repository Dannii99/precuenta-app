# Spec: session-persistence

## ADDED Requirements

### Requirement: Restauración de la sesión tras cierre de la app

El sistema SHALL persistir el estado del carrito en el dispositivo y
restaurarlo íntegro (ítems, cantidades, precios y total) cuando el usuario
vuelve a abrir la app después de que el SO la cerró en segundo plano.

#### Scenario: Recuperación tras process death

- **WHEN** el usuario tenía un carrito con ítems, el SO cerró la app en
  segundo plano, y el usuario la vuelve a abrir
- **THEN** el carrito se restaura con los mismos ítems, cantidades, precios y
  total que tenía

#### Scenario: Primer uso o sin datos

- **WHEN** el usuario abre la app sin datos persistidos
- **THEN** el inicio arranca en estado vacío

### Requirement: Persistencia automática ante cambios

El sistema SHALL persistir el estado del carrito de inmediato ante cualquier
mutación (agregar, editar, eliminar), sin requerir acción explícita del
usuario.

#### Scenario: Persistencia tras mutación

- **WHEN** el usuario agrega, edita o elimina un ítem
- **THEN** el estado resultante queda persistido en el dispositivo de
  inmediato

### Requirement: Robustez ante datos persistidos inválidos

El sistema MUST NOT restaurar datos persistidos corruptos, incompletos o de
una versión de schema desconocida; ante datos inválidos SHALL arrancar en
estado vacío sin error visible para el usuario.

#### Scenario: Payload corrupto

- **WHEN** los datos persistidos están corruptos o incompletos al abrir la app
- **THEN** el sistema descarta los datos, arranca en estado vacío y la app no
  presenta errores

#### Scenario: Versión de schema desconocida

- **WHEN** los datos persistidos tienen una versión de schema que el sistema
  no reconoce
- **THEN** el sistema descarta los datos y arranca en estado vacío
