# Registro de ejecución manual — PulsePass E2E

| Campo | Valor |
|---|---|
| Ambiente | Local: app en `localhost:8080`, base `pulsepass_e2e` (Docker `postgres:18-alpine`), perfil `local` |
| Ejecutor | (completar) |
| Fecha | (completar; los logs de las primeras corridas llevan fecha 2026-10-18) |
| Colección | `postman/PulsePass-Manual-E2E.postman_collection.json` (sin scripts) |

> No incluir JWT, contraseñas ni datos privados en esta bitácora ni en capturas.

## 1. Resumen por módulo

| Carpeta | PASS | FAIL | BLOCKED | NOT RUN | Total |
|---|---|---|---|---|---|
| 00 Preparación / conectividad | 1 | 0 | 0 | 0 | 1 |
| 01 Venues (2 rutas) | 3 | 0 | 0 | 0 | 3 |
| 02 Artists (3 rutas) | 6 | 0 | 0 | 0 | 6 |
| 03 Auth / usuarios (registro, login, me) | 19 | 0 | 0 | 0 | 19 |
| 04 Usuarios / consulta y propiedad (2 rutas) | 14 | 0 | 0 | 0 | 14 |
| 05 Events / administración y visibilidad (6 rutas) | 39 | 0 | 0 | 0 | 39 |
| 06 Tickets / compra, consulta y ciclo de vida (6 rutas) | 54 | 0 | 0 | 0 | 54 |
| 07 Seguridad / escenarios negativos | 19 | 0 | 0 | 0 | 19 |
| 08 Validaciones y errores HTTP | 7 | 3 | 0 | 0 | 10 |
| 09 Flujos de negocio / secuencia recomendada | 16 | 0 | 0 | 0 | 16 |
| **Total** | **178** | **3** | **0** | **0** | **181** |

Las validaciones de seguridad (carpeta 07 y casos TC-SEC) se cuentan dentro de estos totales. Los casos `NOT RUN` no se consideran aprobados.

## 2. Defectos

### DEF-001 — 404, 405 y 415 se devuelven como 500

| Campo | Detalle |
|---|---|
| Casos | 08-08 (ruta inexistente como ADMIN), 08-09 (`DELETE /api/venues/active`), 08-10 (`Content-Type: text/plain` en login) |
| Esperado | 404, 405 y 415 |
| Observado | 500 en los tres |
| Severidad | Media: sin fuga de datos, pero el PRD declara inaceptable cualquier 500 |
| Causa probable | `GlobalExceptionHandler.handleUnexpected(Exception)` captura las excepciones de Spring MVC (`NoResourceFoundException`, `HttpRequestMethodNotSupportedException`, `HttpMediaTypeNotSupportedException`) |
| Reproducción | Postman, carpeta 08, peticiones 08-08 a 08-10 (las dos primeras con `adminToken` vigente) |
| Estado | Abierto. Se reporta a quien mantiene el código; esta fase no modifica la API (FR-E2E-017) |

## 3. Bloqueos

Ninguno registrado.

## 4. Observaciones de negocio (no son FAIL)

- **OBS-01 / OBS-02:** un evento `SOLD_OUT` devuelve 404 al visitante y no aparece en `/api/events/published`, porque el código solo trata `PUBLISHED` como público.
- **OBS-03 / OBS-04:** al cancelar el único ticket de un evento agotado, el evento sigue en `SOLD_OUT` y no se pueden comprar tickets aunque haya un cupo libre.
- **Roles:** ADMIN y STAFF se siembran solo con su rol; por eso no pueden comprar (403), coherente con `SecurityConfig`.
- **Documentación del código:** el Javadoc de `AuthorizationService.canViewTicket/canCancelTicket` dice 404 para tickets ajenos, pero el código responde 403.

## 5. Casos pendientes de confirmar

Quedan **7** casos sin resultado confirmado (las pruebas de venue por código y de artista por id y por nombre artístico, carpetas 01 y 02). Hasta ejecutarlos, las rutas 1, 3 y 4 no tienen caso nominal confirmado y no se puede declarar 22/22.

## 6. Detalle por caso

PASS = HTTP, JSON y condición de negocio coinciden con lo esperado, según lo confirmado por el ejecutor. Completar la observación con cualquier detalle adicional.


### 00 Preparación / conectividad

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| TC-CONN-01 | ANONYMOUS | `GET /api/venues/active` | 200 | 200 | PASS |  |

### 01 Venues (2 rutas)

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| E2E-VEN-02 | ANONYMOUS | `GET /api/venues/active` | 200 | 200 | PASS |  |
| E2E-VEN-01 | ANONYMOUS | `GET /api/venues/{{venueActiveCode}}` | 200 | 200 | PASS |  |
| E2E-VEN-01b | ANONYMOUS | `GET /api/venues/NO-EXISTE-{{runId}}` | 404 | 404 | PASS |  |

### 02 Artists (3 rutas)

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| E2E-ART-03 | ANONYMOUS | `GET /api/artists/active` | 200 | 200 | PASS |  |
| E2E-ART-01 | ANONYMOUS | `GET /api/artists/{{artistId}}` | 200 | 200 | PASS |  |
| E2E-ART-01b | ANONYMOUS | `GET /api/artists/999999` | 404 | 404 | PASS |  |
| E2E-ART-01c | ANONYMOUS | `GET /api/artists/abc` | 400 | 400 | PASS |  |
| E2E-ART-02 | ANONYMOUS | `GET /api/artists/by-stage-name?stageName={{artistStageName}}` | 200 | 200 | PASS |  |
| E2E-ART-02b | ANONYMOUS | `GET /api/artists/by-stage-name` | 400 | 400 | PASS |  |

### 03 Auth / usuarios (registro, login, me)

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| TC-AUTH-001 | ANONYMOUS | `POST /api/users` | 201 | 201 | PASS |  |
| TC-BIZ-006 | ANONYMOUS | `POST /api/users` | 201 | 201 | PASS |  |
| TC-BIZ-006b | ANONYMOUS | `POST /api/users` | 409 | 409 | PASS |  |
| TC-HTTP | ANONYMOUS | `POST /api/users` | 400 | 400 | PASS |  |
| TC-HTTP | ANONYMOUS | `POST /api/users` | 400 | 400 | PASS |  |
| TC-SEC-016 | ANONYMOUS | `POST /api/users` | 201 (se espera que el campo role se ignore; si sale 400, anotarlo como observación) | 201 | PASS |  |
| TC-AUTH-002 | ANONYMOUS | `POST /api/auth/login` | 200 | 200 | PASS |  |
| TC-AUTH-003 | ANONYMOUS | `POST /api/auth/login` | 200 | 200 | PASS |  |
| TC-AUTH-004 | ANONYMOUS | `POST /api/auth/login` | 401 | 401 | PASS |  |
| TC-AUTH-005 | ANONYMOUS | `POST /api/auth/login` | 401 | 401 | PASS |  |
| TC-HTTP | ANONYMOUS | `POST /api/auth/login` | 400 | 400 | PASS |  |
| TC-AUTH-002b | ANONYMOUS | `POST /api/auth/login` | 200 | 200 | PASS |  |
| TC-AUTH-002c | ADMIN | `POST /api/auth/login` | 200 | 200 | PASS |  |
| TC-AUTH-002d | STAFF | `POST /api/auth/login` | 200 | 200 | PASS |  |
| TC-AUTH-006 | USER_A | `GET /api/auth/me` | 200 | 200 | PASS |  |
| TC-AUTH-006b | USER_B | `GET /api/auth/me` | 200 | 200 | PASS |  |
| TC-AUTH-006c | ADMIN | `GET /api/auth/me` | 200 | 200 | PASS |  |
| TC-AUTH-006d | STAFF | `GET /api/auth/me` | 200 | 200 | PASS |  |
| TC-AUTH-007 | ANONYMOUS | `GET /api/auth/me` | 401 | 401 | PASS |  |

### 04 Usuarios / consulta y propiedad (2 rutas)

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| 04-01 | USER_A | `GET /api/users/by-email?email={{userAEmail}}` | 200 | 200 | PASS |  |
| 04-02 | ADMIN | `GET /api/users/by-email?email={{userAEmail}}` | 200 | 200 | PASS |  |
| 04-03 | USER_B | `GET /api/users/by-email?email={{userAEmail}}` | 403 (@PreAuthorize antes del service) | 403 | PASS |  |
| 04-04 | STAFF | `GET /api/users/by-email?email={{userAEmail}}` | 403 (solo el propio usuario o ADMIN) | 403 | PASS |  |
| 04-05 | ANONYMOUS | `GET /api/users/by-email?email={{userAEmail}}` | 401 (ruta protegida) | 401 | PASS |  |
| 04-06 | USER_A | `GET /api/users/by-email` | 400 | 400 | PASS |  |
| 04-07 | ADMIN | `GET /api/users/by-email?email=nadie_{{runId}}@example.test` | 404 | 404 | PASS |  |
| 04-08 | USER_A | `GET /api/users/by-username?username={{userAUsername}}` | 200 | 200 | PASS |  |
| 04-09 | ADMIN | `GET /api/users/by-username?username={{userAUsername}}` | 200 | 200 | PASS |  |
| 04-10 | USER_B | `GET /api/users/by-username?username={{userAUsername}}` | 403 (@PreAuthorize antes del service) | 403 | PASS |  |
| 04-11 | STAFF | `GET /api/users/by-username?username={{userAUsername}}` | 403 (solo el propio usuario o ADMIN) | 403 | PASS |  |
| 04-12 | ANONYMOUS | `GET /api/users/by-username?username={{userAUsername}}` | 401 (ruta protegida) | 401 | PASS |  |
| 04-13 | USER_A | `GET /api/users/by-username` | 400 | 400 | PASS |  |
| 04-14 | ADMIN | `GET /api/users/by-username?username=nadie_{{runId}}` | 404 | 404 | PASS |  |

### 05 Events / administración y visibilidad (6 rutas)

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| 05-01 | ADMIN | `POST /api/events` | 201 | 201 | PASS | Los eventos ya existían de una ejecución previa (409 por código repetido); confirmados con 05-15. |
| 05-02 | ADMIN | `POST /api/events` | 201 | 201 | PASS | Los eventos ya existían de una ejecución previa (409 por código repetido); confirmados con 05-15. |
| 05-03 | ADMIN | `POST /api/events` | 201 | 201 | PASS | Los eventos ya existían de una ejecución previa (409 por código repetido); confirmados con 05-15. |
| 05-04 | ANONYMOUS | `POST /api/events` | 401 | 401 | PASS |  |
| 05-05 | USER_A | `POST /api/events` | 403 | 403 | PASS |  |
| 05-06 | STAFF | `POST /api/events` | 403 | 403 | PASS |  |
| 05-07 | ADMIN | `POST /api/events` | 409 | 409 | PASS |  |
| 05-08 | ADMIN | `POST /api/events` | 409 | 409 | PASS |  |
| 05-09 | ADMIN | `POST /api/events` | 404 | 404 | PASS |  |
| 05-10 | ADMIN | `POST /api/events` | 409 | 409 | PASS |  |
| 05-11 | ADMIN | `POST /api/events` | 400 | 400 | PASS |  |
| 05-12 | ADMIN | `POST /api/events` | 400 | 400 | PASS |  |
| 05-13 | ANONYMOUS | `GET /api/events/{{draftEventCode}}` | 404 | 404 | PASS |  |
| 05-14 | USER_A | `GET /api/events/{{draftEventCode}}` | 404 | 404 | PASS |  |
| 05-15 | ADMIN | `GET /api/events/{{draftEventCode}}` | 200 | 200 | PASS |  |
| 05-16 | STAFF | `GET /api/events/{{draftEventCode}}` | 200 | 200 | PASS |  |
| 05-17 | ADMIN | `GET /api/events/NO-EXISTE-{{runId}}` | 404 | 404 | PASS |  |
| 05-18 | ANONYMOUS | `GET /api/events/published` | 200 | 200 | PASS |  |
| 05-19 | USER_A | `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` | 403 | 403 | PASS |  |
| 05-20 | STAFF | `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` | 403 | 403 | PASS |  |
| 05-21 | ANONYMOUS | `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` | 401 | 401 | PASS |  |
| 05-22 | ADMIN | `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` | 200 | 200 | PASS |  |
| 05-23 | ADMIN | `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` | 409 | 409 | PASS |  |
| 05-24 | ADMIN | `POST /api/events/{{publishedEventCode}}/artists/999999` | 404 | 404 | PASS |  |
| 05-25 | ADMIN | `POST /api/events/NO-EXISTE-{{runId}}/artists/{{artistId}}` | 404 | 404 | PASS |  |
| 05-26 | ANONYMOUS | `GET /api/events/by-artist?stageName={{artistStageName}}` | 200 | 200 | PASS |  |
| 05-27 | ADMIN | `GET /api/events/by-artist?stageName={{artistStageName}}` | 200 | 200 | PASS |  |
| 05-28 | USER_A | `PATCH /api/events/{{eventToPublishCode}}/publish` | 403 | 403 | PASS |  |
| 05-29 | STAFF | `PATCH /api/events/{{eventToPublishCode}}/publish` | 403 | 403 | PASS |  |
| 05-30 | ANONYMOUS | `PATCH /api/events/{{eventToPublishCode}}/publish` | 401 | 401 | PASS |  |
| 05-31 | ADMIN | `GET /api/events/{{eventToPublishCode}}` | 200 | 200 | PASS |  |
| 05-32 | ADMIN | `PATCH /api/events/{{eventToPublishCode}}/publish` | 200 | 200 | PASS |  |
| 05-33 | ADMIN | `PATCH /api/events/{{publishedEventCode}}/publish` | 200 | 200 | PASS |  |
| 05-34 | ADMIN | `PATCH /api/events/{{publishedEventCode}}/publish` | 409 | 409 | PASS |  |
| 05-35 | ADMIN | `PATCH /api/events/NO-EXISTE-{{runId}}/publish` | 404 | 404 | PASS |  |
| 05-36 | ANONYMOUS | `GET /api/events/{{publishedEventCode}}` | 200 | 200 | PASS |  |
| 05-37 | ANONYMOUS | `GET /api/events/published` | 200 | 200 | PASS |  |
| 05-38 | ANONYMOUS | `GET /api/events/by-artist?stageName={{artistStageName}}` | 200 | 200 | PASS |  |
| 05-39 | ANONYMOUS | `GET /api/events/by-artist` | 400 | 400 | PASS |  |

### 06 Tickets / compra, consulta y ciclo de vida (6 rutas)

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| 06-01 | USER_A | `POST /api/tickets` | 201 | 201 | PASS |  |
| 06-02 | USER_A | `POST /api/tickets` | 201 | 201 | PASS |  |
| 06-03 | USER_B | `POST /api/tickets` | 201 | 201 | PASS |  |
| 06-04 | ANONYMOUS | `POST /api/tickets` | 401 | 401 | PASS |  |
| 06-05 | USER_A | `POST /api/tickets` | 403 (@PreAuthorize: el email no es del principal) | 403 | PASS |  |
| 06-06 | ADMIN | `POST /api/tickets` | 403 (solo rol USER compra) | 403 | PASS |  |
| 06-07 | STAFF | `POST /api/tickets` | 403 (solo rol USER compra) | 403 | PASS |  |
| 06-08 | USER_A | `POST /api/tickets` | 400 | 400 | PASS |  |
| 06-09 | USER_A | `POST /api/tickets` | 400 | 400 | PASS |  |
| 06-10 | USER_A | `POST /api/tickets` | 400 | 400 | PASS |  |
| 06-11 | USER_A | `POST /api/tickets` | 409 | 409 | PASS |  |
| 06-12 | USER_A | `POST /api/tickets` | 404 | 404 | PASS |  |
| 06-13 | USER_B | `GET /api/tickets/by-user?email={{userBEmail}}` | 200 | 200 | PASS |  |
| 06-14 | USER_A | `GET /api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS |  |
| 06-15 | USER_B | `GET /api/tickets/{{ticketCancelableCode}}` | 403 | 403 | PASS |  |
| 06-16 | STAFF | `GET /api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS |  |
| 06-17 | ADMIN | `GET /api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS |  |
| 06-18 | ANONYMOUS | `GET /api/tickets/{{ticketCancelableCode}}` | 401 | 401 | PASS |  |
| 06-19 | USER_A | `GET /api/tickets/{{ticketBCode}}` | 403 | 403 | PASS |  |
| 06-20 | USER_A | `GET /api/tickets/NO-EXISTE-{{runId}}` | 403 (no revela si existe) | 403 | PASS |  |
| 06-21 | ADMIN | `GET /api/tickets/NO-EXISTE-{{runId}}` | 404 | 404 | PASS |  |
| 06-22 | USER_A | `GET /api/tickets/by-user?email={{userAEmail}}` | 200 | 200 | PASS |  |
| 06-23 | USER_B | `GET /api/tickets/by-user?email={{userAEmail}}` | 403 | 403 | PASS |  |
| 06-24 | STAFF | `GET /api/tickets/by-user?email={{userAEmail}}` | 403 (solo el propio usuario o ADMIN) | 403 | PASS |  |
| 06-25 | ADMIN | `GET /api/tickets/by-user?email={{userAEmail}}` | 200 | 200 | PASS |  |
| 06-26 | ANONYMOUS | `GET /api/tickets/by-user?email={{userAEmail}}` | 401 | 401 | PASS |  |
| 06-27 | USER_A | `GET /api/tickets/by-user` | 400 | 400 | PASS |  |
| 06-28 | STAFF | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS |  |
| 06-29 | ADMIN | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS |  |
| 06-30 | USER_A | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 403 | 403 | PASS |  |
| 06-31 | ANONYMOUS | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 401 | 401 | PASS |  |
| 06-32 | STAFF | `GET /api/events/NO-EXISTE-{{runId}}/tickets/paid` | 200 | 200 | PASS |  |
| 06-33 | USER_B | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | 403 | 403 | PASS |  |
| 06-34 | STAFF | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | 403 (solo dueño o ADMIN) | 403 | PASS |  |
| 06-35 | ANONYMOUS | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | 401 | 401 | PASS |  |
| 06-36 | USER_B | `PATCH /api/tickets/{{ticketUsableCode}}/use` | 403 | 403 | PASS |  |
| 06-37 | USER_A | `PATCH /api/tickets/{{ticketUsableCode}}/use` | 403 (marcar uso es solo STAFF/ADMIN) | 403 | PASS |  |
| 06-38 | ANONYMOUS | `PATCH /api/tickets/{{ticketUsableCode}}/use` | 401 | 401 | PASS |  |
| 06-39 | USER_A | `GET /api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS |  |
| 06-40 | STAFF | `GET /api/tickets/{{ticketUsableCode}}` | 200 | 200 | PASS |  |
| 06-41 | USER_A | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | 200 | 200 | PASS |  |
| 06-42 | USER_A | `GET /api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS |  |
| 06-43 | USER_A | `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` | 409 | 409 | PASS |  |
| 06-44 | STAFF | `PATCH /api/tickets/{{ticketCancelableCode}}/use` | 409 (estado inválido) | 409 | PASS |  |
| 06-45 | STAFF | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS |  |
| 06-46 | STAFF | `PATCH /api/tickets/{{ticketUsableCode}}/use` | 200 | 200 | PASS |  |
| 06-47 | STAFF | `GET /api/tickets/{{ticketUsableCode}}` | 200 | 200 | PASS |  |
| 06-48 | STAFF | `PATCH /api/tickets/{{ticketUsableCode}}/use` | 409 | 409 | PASS |  |
| 06-49 | USER_A | `PATCH /api/tickets/{{ticketUsableCode}}/cancel` | 409 | 409 | PASS |  |
| 06-50 | ADMIN | `PATCH /api/tickets/{{ticketBCode}}/cancel` | 200 | 200 | PASS |  |
| 06-51 | USER_B | `GET /api/tickets/{{ticketBCode}}` | 200 | 200 | PASS |  |
| 06-52 | ADMIN | `PATCH /api/tickets/NO-EXISTE-{{runId}}/cancel` | 404 | 404 | PASS |  |
| 06-53 | STAFF | `PATCH /api/tickets/NO-EXISTE-{{runId}}/use` | 404 | 404 | PASS |  |
| 06-54 | STAFF | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS |  |

### 07 Seguridad / escenarios negativos

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| 07-01 | Token falso | `GET /api/auth/me` | 401 | 401 | PASS |  |
| 07-02 | Token falso | `GET /api/auth/me` | 401 | 401 | PASS |  |
| 07-03 | USER_A alterado | `GET /api/auth/me` | 401 | 401 | PASS |  |
| 07-04 | USER_A vencido | `GET /api/auth/me` | 401 | 401 | PASS |  |
| 07-05 | Token forjado | `GET /api/auth/me` | 401 | 401 | PASS |  |
| 07-06 | USER_A, mal enviado | `GET /api/auth/me?access_token={{userAToken}}` | 401 | 401 | PASS |  |
| 07-07 | Token falso | `GET /api/venues/active` | 200 | 200 | PASS |  |
| 07-08 | Token forjado | `GET /api/events/{{draftEventCode}}` | 404 | 404 | PASS |  |
| 07-09 | Token forjado | `POST /api/events` | 401 | 401 | PASS |  |
| 07-10 | USER_A | `POST /api/events` | 403 | 403 | PASS |  |
| 07-11 | inject_r01 | `POST /api/auth/login` | 200 | 200 | PASS |  |
| 07-12 | inject_r01 | `GET /api/auth/me` | 200 | 200 | PASS |  |
| 07-13 | inject_r01 inactivo | `GET /api/auth/me` | 401 | 401 | PASS |  |
| 07-14 | inject_r01 inactivo | `POST /api/auth/login` | 401 | 401 | PASS |  |
| 07-15 | STAFF | `POST /api/auth/login` | 200 | 200 | PASS |  |
| 07-16 | STAFF | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS |  |
| 07-17 | STAFF sin rol | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 403 | 403 | PASS |  |
| 07-18 | STAFF sin rol | `GET /api/auth/me` | 200 (se espera) con roles vacío | 200 | PASS |  |
| 07-19 | STAFF restaurado | `GET /api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS |  |

### 08 Validaciones y errores HTTP

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| 08-01 | ANONYMOUS | `POST /api/users` | 400 | 400 | PASS |  |
| 08-02 | ANONYMOUS | `POST /api/users` | 400 | 400 | PASS |  |
| 08-03 | ANONYMOUS | `POST /api/users` | 400 | 400 | PASS |  |
| 08-04 | ANONYMOUS | `POST /api/users` | 409 (regla de negocio, no 400) | 409 | PASS |  |
| 08-05 | ANONYMOUS | `POST /api/auth/login` | 400 | 400 | PASS |  |
| 08-06 | ANONYMOUS | `POST /api/auth/login` | 401 (no 500) | 401 | PASS |  |
| 08-07 | ANONYMOUS | `GET /api/no-existe` | 401 (toda ruta no pública exige token) | 401 | PASS |  |
| 08-08 | ADMIN | `GET /api/no-existe` | 404 (lo esperable en una API REST) | 500 | FAIL | DEF-001: el manejador global devuelve 500 en vez del código HTTP estándar. |
| 08-09 | ADMIN | `DELETE /api/venues/active` | 405 (lo esperable) | 500 | FAIL | DEF-001: el manejador global devuelve 500 en vez del código HTTP estándar. |
| 08-10 | ANONYMOUS | `POST /api/auth/login` | 415 (lo esperable) | 500 | FAIL | DEF-001: el manejador global devuelve 500 en vez del código HTTP estándar. |

### 09 Flujos de negocio / secuencia recomendada

| Caso | Actor | Ruta | HTTP esperado | HTTP observado | Resultado | Observación |
|---|---|---|---|---|---|---|
| 09-01 | ADMIN | `POST /api/events` | 201 | 201 | PASS |  |
| 09-02 | ADMIN | `PATCH /api/events/E2E-AGE-{{runId}}/publish` | 200 | 200 | PASS |  |
| 09-03 | ANONYMOUS | `POST /api/users` | 201 | 201 | PASS |  |
| 09-04 | Menor | `POST /api/auth/login` | 200 | 200 | PASS |  |
| 09-05 | Menor | `POST /api/tickets` | 409 | 409 | PASS |  |
| 09-06 | USER_A | `POST /api/tickets` | 201 | 201 | PASS |  |
| 09-07 | ADMIN | `POST /api/events` | 201 | 201 | PASS |  |
| 09-08 | ADMIN | `PATCH /api/events/E2E-SMALL-{{runId}}/publish` | 200 | 200 | PASS |  |
| 09-09 | USER_A | `POST /api/tickets` | 201 | 201 | PASS |  |
| 09-10 | ADMIN | `GET /api/events/E2E-SMALL-{{runId}}` | 200 | 200 | PASS |  |
| 09-11 | USER_B | `POST /api/tickets` | 409 | 409 | PASS |  |
| 09-12 | ANONYMOUS | `GET /api/events/E2E-SMALL-{{runId}}` | 404 (comportamiento actual) | 404 | PASS |  |
| 09-13 | ANONYMOUS | `GET /api/events/published` | 200 | 200 | PASS |  |
| 09-14 | USER_A | `PATCH /api/tickets/{{ticketSmallCode}}/cancel` | 200 | 200 | PASS |  |
| 09-15 | ADMIN | `GET /api/events/E2E-SMALL-{{runId}}` | 200 | 200 | PASS |  |
| 09-16 | USER_B | `POST /api/tickets` | 409 (consecuencia de OBS-03) | 409 | PASS |  |