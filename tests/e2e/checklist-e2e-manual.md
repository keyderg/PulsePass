# Checklist de ejecución manual — PulsePass E2E

Orden obligatorio: carpetas 00 → 09. Cada petición se envía con **Send**, una por una (sin Runner). Antes de cada petición protegida, comprobar el token elegido y su vigencia (15 min).

## Antes de empezar

- [ ] Docker corriendo y contenedor `pulsepass-e2e-db` en estado `Up`.
- [ ] App arrancada con perfil `local` contra `pulsepass_e2e`; log con `seed_created ... admin` y `seed_created ... laura`.
- [ ] Venues cargados con `fixtures/seed-e2e.sql` (`INSERT 0 3`).
- [ ] Ambiente `PulsePass local E2E` seleccionado; contraseñas en la columna **Value** (nunca en *Shared Value*).
- [ ] `artistId` = id de Solar Beat (de `GET /api/artists/active`).

## Pasos manuales especiales

| Cuándo | Acción |
|---|---|
| Tras cada login (carpetas 03, 07, 09) | Copiar solo `accessToken` a la variable del actor, en **Value**, y guardar |
| 06-01, 06-02, 06-03 | Copiar `ticketCode` a `ticketCancelableCode`, `ticketUsableCode` y `ticketBCode` |
| Carpeta 07 (token vencido) | Copiar un `userAToken` antiguo (más de 15 min) a `expiredToken` |
| Carpeta 07 (token alterado) | Copiar `userAToken` a `tamperedToken` y cambiar un carácter en medio de la firma |
| Carpeta 07 (token forjado) | Pegar en `forgedToken` el token firmado con clave desechable (ver README) |
| 07-13 | Desactivar a `inject_r01` con SQL (ver README) |
| 07-17 y 07-19 | Revocar y luego restaurar el rol STAFF de `laura` con SQL (ver README) |
| 09-04 y 09-09 | Copiar `accessToken` a `minorToken` y `ticketCode` a `ticketSmallCode` |

## Peticiones en orden


### 00 Preparación / conectividad

- [ ] **TC-CONN-01 · GET venues activos (conectividad)** — `GET /api/venues/active` — actor: ANONYMOUS — esperado: **200**

### 01 Venues (2 rutas)

- [ ] **E2E-VEN-02 · GET venues activos** — `GET /api/venues/active` — actor: ANONYMOUS — esperado: **200**
- [ ] **E2E-VEN-01 · GET venue por código (existente)** — `GET /api/venues/{{venueActiveCode}}` — actor: ANONYMOUS — esperado: **200**
- [ ] **E2E-VEN-01b · GET venue por código (ausente)** — `GET /api/venues/NO-EXISTE-{{runId}}` — actor: ANONYMOUS — esperado: **404**

### 02 Artists (3 rutas)

- [ ] **E2E-ART-03 · GET artistas activos** — `GET /api/artists/active` — actor: ANONYMOUS — esperado: **200**
- [ ] **E2E-ART-01 · GET artista por id (existente)** — `GET /api/artists/{{artistId}}` — actor: ANONYMOUS — esperado: **200**
- [ ] **E2E-ART-01b · GET artista por id (ausente)** — `GET /api/artists/999999` — actor: ANONYMOUS — esperado: **404**
- [ ] **E2E-ART-01c · GET artista con id no numérico** — `GET /api/artists/abc` — actor: ANONYMOUS — esperado: **400**
- [ ] **E2E-ART-02 · GET artista por stageName** — `GET /api/artists/by-stage-name?stageName={{artistStageName}}` — actor: ANONYMOUS — esperado: **200**
- [ ] **E2E-ART-02b · GET artista por stageName (sin parámetro)** — `GET /api/artists/by-stage-name` — actor: ANONYMOUS — esperado: **400**

### 03 Auth / usuarios (registro, login, me)

- [ ] **TC-AUTH-001 · Registrar USER_A** — `POST /api/users` — actor: ANONYMOUS — esperado: **201**
- [ ] **TC-BIZ-006 · Registrar USER_B** — `POST /api/users` — actor: ANONYMOUS — esperado: **201**
- [ ] **TC-BIZ-006b · Registrar USER_A duplicado** — `POST /api/users` — actor: ANONYMOUS — esperado: **409**
- [ ] **TC-HTTP · Registro con campos obligatorios ausentes** — `POST /api/users` — actor: ANONYMOUS — esperado: **400**
- [ ] **TC-HTTP · Registro con password corta (<12)** — `POST /api/users` — actor: ANONYMOUS — esperado: **400**
- [ ] **TC-SEC-016 · Registro con role=ADMIN inyectado** — `POST /api/users` — actor: ANONYMOUS — esperado: **201 (se espera que el campo role se ignore; si sale 400, anotarlo como observación)**
- [ ] **TC-AUTH-002 · Login USER_A con username** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **200**
- [ ] **TC-AUTH-003 · Login USER_A con email** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **200**
- [ ] **TC-AUTH-004 · Login con password incorrecta** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **401**
- [ ] **TC-AUTH-005 · Login con identificador inexistente** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **401**
- [ ] **TC-HTTP · Login con body vacío** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **400**
- [ ] **TC-AUTH-002b · Login USER_B** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **200**
- [ ] **TC-AUTH-002c · Login ADMIN (fixture)** — `POST /api/auth/login` — actor: ADMIN — esperado: **200**
- [ ] **TC-AUTH-002d · Login STAFF (fixture)** — `POST /api/auth/login` — actor: STAFF — esperado: **200**
- [ ] **TC-AUTH-006 · GET /me con token de USER_A** — `GET /api/auth/me` — actor: USER_A — esperado: **200**
- [ ] **TC-AUTH-006b · GET /me con token de USER_B** — `GET /api/auth/me` — actor: USER_B — esperado: **200**
- [ ] **TC-AUTH-006c · GET /me con token de ADMIN** — `GET /api/auth/me` — actor: ADMIN — esperado: **200**
- [ ] **TC-AUTH-006d · GET /me con token de STAFF** — `GET /api/auth/me` — actor: STAFF — esperado: **200**
- [ ] **TC-AUTH-007 · GET /me sin token** — `GET /api/auth/me` — actor: ANONYMOUS — esperado: **401**

### 04 Usuarios / consulta y propiedad (2 rutas)

- [ ] **04-01 · E2E-USR-02a · GET by-email de A como USER_A** — `GET /api/users/by-email?email={{userAEmail}}` — actor: USER_A — esperado: **200**
- [ ] **04-02 · E2E-USR-02b · GET by-email de A como ADMIN** — `GET /api/users/by-email?email={{userAEmail}}` — actor: ADMIN — esperado: **200**
- [ ] **04-03 · TC-SEC-006 · GET by-email de A como USER_B** — `GET /api/users/by-email?email={{userAEmail}}` — actor: USER_B — esperado: **403 (@PreAuthorize antes del service)**
- [ ] **04-04 · E2E-USR-02c · GET by-email de A como STAFF** — `GET /api/users/by-email?email={{userAEmail}}` — actor: STAFF — esperado: **403 (solo el propio usuario o ADMIN)**
- [ ] **04-05 · E2E-USR-02d · GET by-email de A como ANONYMOUS** — `GET /api/users/by-email?email={{userAEmail}}` — actor: ANONYMOUS — esperado: **401 (ruta protegida)**
- [ ] **04-06 · E2E-USR-02e · GET by-email sin parámetro como USER_A** — `GET /api/users/by-email` — actor: USER_A — esperado: **400**
- [ ] **04-07 · E2E-USR-02f · GET by-email inexistente como ADMIN** — `GET /api/users/by-email?email=nadie_{{runId}}@example.test` — actor: ADMIN — esperado: **404**
- [ ] **04-08 · E2E-USR-03a · GET by-username de A como USER_A** — `GET /api/users/by-username?username={{userAUsername}}` — actor: USER_A — esperado: **200**
- [ ] **04-09 · E2E-USR-03b · GET by-username de A como ADMIN** — `GET /api/users/by-username?username={{userAUsername}}` — actor: ADMIN — esperado: **200**
- [ ] **04-10 · TC-SEC-007 · GET by-username de A como USER_B** — `GET /api/users/by-username?username={{userAUsername}}` — actor: USER_B — esperado: **403 (@PreAuthorize antes del service)**
- [ ] **04-11 · E2E-USR-03c · GET by-username de A como STAFF** — `GET /api/users/by-username?username={{userAUsername}}` — actor: STAFF — esperado: **403 (solo el propio usuario o ADMIN)**
- [ ] **04-12 · E2E-USR-03d · GET by-username de A como ANONYMOUS** — `GET /api/users/by-username?username={{userAUsername}}` — actor: ANONYMOUS — esperado: **401 (ruta protegida)**
- [ ] **04-13 · E2E-USR-03e · GET by-username sin parámetro como USER_A** — `GET /api/users/by-username` — actor: USER_A — esperado: **400**
- [ ] **04-14 · E2E-USR-03f · GET by-username inexistente como ADMIN** — `GET /api/users/by-username?username=nadie_{{runId}}` — actor: ADMIN — esperado: **404**

### 05 Events / administración y visibilidad (6 rutas)

- [ ] **05-01 · TC-BIZ-003 · Crear evento BORRADOR (draftEventCode)** — `POST /api/events` — actor: ADMIN — esperado: **201**
- [ ] **05-02 · TC-BIZ-003b · Crear evento (eventToPublishCode)** — `POST /api/events` — actor: ADMIN — esperado: **201**
- [ ] **05-03 · TC-BIZ-003c · Crear evento (publishedEventCode)** — `POST /api/events` — actor: ADMIN — esperado: **201**
- [ ] **05-04 · TC-SEC-001 · Crear evento sin token** — `POST /api/events` — actor: ANONYMOUS — esperado: **401**
- [ ] **05-05 · TC-SEC-001b · Crear evento como USER_A** — `POST /api/events` — actor: USER_A — esperado: **403**
- [ ] **05-06 · TC-SEC-001c · Crear evento como STAFF** — `POST /api/events` — actor: STAFF — esperado: **403**
- [ ] **05-07 · TC-BIZ-015a · Crear evento con eventCode duplicado** — `POST /api/events` — actor: ADMIN — esperado: **409**
- [ ] **05-08 · TC-BIZ-015b · Crear evento con fecha pasada** — `POST /api/events` — actor: ADMIN — esperado: **409**
- [ ] **05-09 · TC-BIZ-015c · Crear evento con venue inexistente** — `POST /api/events` — actor: ADMIN — esperado: **404**
- [ ] **05-10 · TC-BIZ-015d · Crear evento en venue inactivo** — `POST /api/events` — actor: ADMIN — esperado: **409**
- [ ] **05-11 · TC-HTTP · Crear evento con categoría inválida** — `POST /api/events` — actor: ADMIN — esperado: **400**
- [ ] **05-12 · TC-HTTP · Crear evento con campos obligatorios ausentes** — `POST /api/events` — actor: ADMIN — esperado: **400**
- [ ] **05-13 · TC-SEC-004 · GET borrador por código como anónimo** — `GET /api/events/{{draftEventCode}}` — actor: ANONYMOUS — esperado: **404**
- [ ] **05-14 · TC-SEC-004b · GET borrador como USER_A** — `GET /api/events/{{draftEventCode}}` — actor: USER_A — esperado: **404**
- [ ] **05-15 · TC-SEC-015 · GET borrador como ADMIN** — `GET /api/events/{{draftEventCode}}` — actor: ADMIN — esperado: **200**
- [ ] **05-16 · TC-SEC-015b · GET borrador como STAFF** — `GET /api/events/{{draftEventCode}}` — actor: STAFF — esperado: **200**
- [ ] **05-17 · E2E-EVT-02b · GET evento inexistente** — `GET /api/events/NO-EXISTE-{{runId}}` — actor: ADMIN — esperado: **404**
- [ ] **05-18 · E2E-EVT-03a · GET publicados (antes de publicar)** — `GET /api/events/published` — actor: ANONYMOUS — esperado: **200**
- [ ] **05-19 · TC-SEC-003 · Asociar artista como USER_A** — `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` — actor: USER_A — esperado: **403**
- [ ] **05-20 · TC-SEC-003b · Asociar artista como STAFF** — `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` — actor: STAFF — esperado: **403**
- [ ] **05-21 · TC-SEC-003c · Asociar artista sin token** — `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` — actor: ANONYMOUS — esperado: **401**
- [ ] **05-22 · E2E-EVT-05 · Asociar artista como ADMIN** — `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` — actor: ADMIN — esperado: **200**
- [ ] **05-23 · E2E-EVT-05b · Asociar el mismo artista otra vez** — `POST /api/events/{{publishedEventCode}}/artists/{{artistId}}` — actor: ADMIN — esperado: **409**
- [ ] **05-24 · E2E-EVT-05c · Asociar artista inexistente** — `POST /api/events/{{publishedEventCode}}/artists/999999` — actor: ADMIN — esperado: **404**
- [ ] **05-25 · E2E-EVT-05d · Asociar artista a evento inexistente** — `POST /api/events/NO-EXISTE-{{runId}}/artists/{{artistId}}` — actor: ADMIN — esperado: **404**
- [ ] **05-26 · TC-SEC-005 · Eventos por artista como anónimo (aún en borrador)** — `GET /api/events/by-artist?stageName={{artistStageName}}` — actor: ANONYMOUS — esperado: **200**
- [ ] **05-27 · E2E-EVT-06a · Eventos por artista como ADMIN (con borrador)** — `GET /api/events/by-artist?stageName={{artistStageName}}` — actor: ADMIN — esperado: **200**
- [ ] **05-28 · TC-SEC-002 · Publicar como USER_A** — `PATCH /api/events/{{eventToPublishCode}}/publish` — actor: USER_A — esperado: **403**
- [ ] **05-29 · TC-SEC-002b · Publicar como STAFF** — `PATCH /api/events/{{eventToPublishCode}}/publish` — actor: STAFF — esperado: **403**
- [ ] **05-30 · TC-SEC-002c · Publicar sin token** — `PATCH /api/events/{{eventToPublishCode}}/publish` — actor: ANONYMOUS — esperado: **401**
- [ ] **05-31 · TC-SEC-002d · Comprobar que sigue en borrador** — `GET /api/events/{{eventToPublishCode}}` — actor: ADMIN — esperado: **200**
- [ ] **05-32 · E2E-EVT-04a · Publicar eventToPublish como ADMIN** — `PATCH /api/events/{{eventToPublishCode}}/publish` — actor: ADMIN — esperado: **200**
- [ ] **05-33 · E2E-EVT-04b · Publicar publishedEvent como ADMIN** — `PATCH /api/events/{{publishedEventCode}}/publish` — actor: ADMIN — esperado: **200**
- [ ] **05-34 · E2E-EVT-04c · Publicar otra vez** — `PATCH /api/events/{{publishedEventCode}}/publish` — actor: ADMIN — esperado: **409**
- [ ] **05-35 · E2E-EVT-04d · Publicar evento inexistente** — `PATCH /api/events/NO-EXISTE-{{runId}}/publish` — actor: ADMIN — esperado: **404**
- [ ] **05-36 · E2E-EVT-02 · GET evento publicado como anónimo** — `GET /api/events/{{publishedEventCode}}` — actor: ANONYMOUS — esperado: **200**
- [ ] **05-37 · E2E-EVT-03 · GET publicados** — `GET /api/events/published` — actor: ANONYMOUS — esperado: **200**
- [ ] **05-38 · E2E-EVT-06 · Eventos por artista como anónimo (ya publicado)** — `GET /api/events/by-artist?stageName={{artistStageName}}` — actor: ANONYMOUS — esperado: **200**
- [ ] **05-39 · E2E-EVT-06b · Eventos por artista sin parámetro** — `GET /api/events/by-artist` — actor: ANONYMOUS — esperado: **400**

### 06 Tickets / compra, consulta y ciclo de vida (6 rutas)

- [ ] **06-01 · TC-BIZ-007 · Comprar ticket T1 como USER_A (GENERAL)** — `POST /api/tickets` — actor: USER_A — esperado: **201**
- [ ] **06-02 · TC-BIZ-007b · Comprar ticket T2 como USER_A (VIP)** — `POST /api/tickets` — actor: USER_A — esperado: **201**
- [ ] **06-03 · TC-BIZ-007c · Comprar ticket T3 como USER_B (GENERAL)** — `POST /api/tickets` — actor: USER_B — esperado: **201**
- [ ] **06-04 · E2E-TKT-01c · Comprar sin token** — `POST /api/tickets` — actor: ANONYMOUS — esperado: **401**
- [ ] **06-05 · TC-SEC-008 · Comprar como USER_A con el email de USER_B** — `POST /api/tickets` — actor: USER_A — esperado: **403 (@PreAuthorize: el email no es del principal)**
- [ ] **06-06 · E2E-TKT-01d · Comprar como ADMIN** — `POST /api/tickets` — actor: ADMIN — esperado: **403 (solo rol USER compra)**
- [ ] **06-07 · E2E-TKT-01e · Comprar como STAFF** — `POST /api/tickets` — actor: STAFF — esperado: **403 (solo rol USER compra)**
- [ ] **06-08 · TC-HTTP · Comprar con campos ausentes** — `POST /api/tickets` — actor: USER_A — esperado: **400**
- [ ] **06-09 · TC-HTTP · Comprar con tipo de ticket inválido** — `POST /api/tickets` — actor: USER_A — esperado: **400**
- [ ] **06-10 · TC-HTTP · Comprar con email mal formado** — `POST /api/tickets` — actor: USER_A — esperado: **400**
- [ ] **06-11 · TC-BIZ-014 · Comprar para evento en borrador** — `POST /api/tickets` — actor: USER_A — esperado: **409**
- [ ] **06-12 · TC-BIZ-015 · Comprar para evento inexistente** — `POST /api/tickets` — actor: USER_A — esperado: **404**
- [ ] **06-13 · TC-SEC-008b · USER_B solo tiene su propio ticket** — `GET /api/tickets/by-user?email={{userBEmail}}` — actor: USER_B — esperado: **200**
- [ ] **06-14 · E2E-TKT-02a · GET ticket T1 como dueño (USER_A)** — `GET /api/tickets/{{ticketCancelableCode}}` — actor: USER_A — esperado: **200**
- [ ] **06-15 · TC-SEC-009 · GET ticket T1 como USER_B** — `GET /api/tickets/{{ticketCancelableCode}}` — actor: USER_B — esperado: **403**
- [ ] **06-16 · E2E-TKT-02b · GET ticket T1 como STAFF** — `GET /api/tickets/{{ticketCancelableCode}}` — actor: STAFF — esperado: **200**
- [ ] **06-17 · E2E-TKT-02c · GET ticket T1 como ADMIN** — `GET /api/tickets/{{ticketCancelableCode}}` — actor: ADMIN — esperado: **200**
- [ ] **06-18 · E2E-TKT-02d · GET ticket T1 sin token** — `GET /api/tickets/{{ticketCancelableCode}}` — actor: ANONYMOUS — esperado: **401**
- [ ] **06-19 · TC-SEC-009b · GET ticket T3 (de B) como USER_A** — `GET /api/tickets/{{ticketBCode}}` — actor: USER_A — esperado: **403**
- [ ] **06-20 · E2E-TKT-02e · GET ticket inexistente como USER_A** — `GET /api/tickets/NO-EXISTE-{{runId}}` — actor: USER_A — esperado: **403 (no revela si existe)**
- [ ] **06-21 · E2E-TKT-02f · GET ticket inexistente como ADMIN** — `GET /api/tickets/NO-EXISTE-{{runId}}` — actor: ADMIN — esperado: **404**
- [ ] **06-22 · E2E-TKT-03a · Tickets de A como USER_A** — `GET /api/tickets/by-user?email={{userAEmail}}` — actor: USER_A — esperado: **200**
- [ ] **06-23 · TC-SEC-010 · Tickets de A como USER_B** — `GET /api/tickets/by-user?email={{userAEmail}}` — actor: USER_B — esperado: **403**
- [ ] **06-24 · E2E-TKT-03b · Tickets de A como STAFF** — `GET /api/tickets/by-user?email={{userAEmail}}` — actor: STAFF — esperado: **403 (solo el propio usuario o ADMIN)**
- [ ] **06-25 · E2E-TKT-03c · Tickets de A como ADMIN** — `GET /api/tickets/by-user?email={{userAEmail}}` — actor: ADMIN — esperado: **200**
- [ ] **06-26 · E2E-TKT-03d · Tickets de A sin token** — `GET /api/tickets/by-user?email={{userAEmail}}` — actor: ANONYMOUS — esperado: **401**
- [ ] **06-27 · E2E-TKT-03e · Tickets por usuario sin parámetro** — `GET /api/tickets/by-user` — actor: USER_A — esperado: **400**
- [ ] **06-28 · TC-BIZ-009 · Tickets pagados del evento como STAFF** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: STAFF — esperado: **200**
- [ ] **06-29 · E2E-TKT-04b · Tickets pagados como ADMIN** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: ADMIN — esperado: **200**
- [ ] **06-30 · TC-SEC-013 · Tickets pagados como USER_A** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: USER_A — esperado: **403**
- [ ] **06-31 · E2E-TKT-04c · Tickets pagados sin token** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: ANONYMOUS — esperado: **401**
- [ ] **06-32 · E2E-TKT-04d · Tickets pagados de evento inexistente** — `GET /api/events/NO-EXISTE-{{runId}}/tickets/paid` — actor: STAFF — esperado: **200**
- [ ] **06-33 · TC-SEC-011 · Cancelar T1 como USER_B** — `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` — actor: USER_B — esperado: **403**
- [ ] **06-34 · E2E-TKT-05a · Cancelar T1 como STAFF** — `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` — actor: STAFF — esperado: **403 (solo dueño o ADMIN)**
- [ ] **06-35 · E2E-TKT-05b · Cancelar T1 sin token** — `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` — actor: ANONYMOUS — esperado: **401**
- [ ] **06-36 · TC-SEC-012 · Usar T2 como USER_B** — `PATCH /api/tickets/{{ticketUsableCode}}/use` — actor: USER_B — esperado: **403**
- [ ] **06-37 · E2E-TKT-06a · Usar T2 como USER_A (dueño)** — `PATCH /api/tickets/{{ticketUsableCode}}/use` — actor: USER_A — esperado: **403 (marcar uso es solo STAFF/ADMIN)**
- [ ] **06-38 · E2E-TKT-06b · Usar T2 sin token** — `PATCH /api/tickets/{{ticketUsableCode}}/use` — actor: ANONYMOUS — esperado: **401**
- [ ] **06-39 · TC-SEC-011b · Comprobar que T1 sigue PAID** — `GET /api/tickets/{{ticketCancelableCode}}` — actor: USER_A — esperado: **200**
- [ ] **06-40 · TC-SEC-012b · Comprobar que T2 sigue PAID** — `GET /api/tickets/{{ticketUsableCode}}` — actor: STAFF — esperado: **200**
- [ ] **06-41 · TC-BIZ-010 · Cancelar T1 como dueño (USER_A)** — `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` — actor: USER_A — esperado: **200**
- [ ] **06-42 · TC-BIZ-010b · Releer T1** — `GET /api/tickets/{{ticketCancelableCode}}` — actor: USER_A — esperado: **200**
- [ ] **06-43 · TC-BIZ-011 · Cancelar T1 otra vez** — `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` — actor: USER_A — esperado: **409**
- [ ] **06-44 · E2E-TKT-06c · Usar T1 (ya cancelado) como STAFF** — `PATCH /api/tickets/{{ticketCancelableCode}}/use` — actor: STAFF — esperado: **409 (estado inválido)**
- [ ] **06-45 · TC-BIZ-009b · Pagados tras cancelar T1** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: STAFF — esperado: **200**
- [ ] **06-46 · TC-BIZ-012 · Usar T2 como STAFF** — `PATCH /api/tickets/{{ticketUsableCode}}/use` — actor: STAFF — esperado: **200**
- [ ] **06-47 · TC-BIZ-012b · Releer T2** — `GET /api/tickets/{{ticketUsableCode}}` — actor: STAFF — esperado: **200**
- [ ] **06-48 · TC-BIZ-013 · Usar T2 otra vez** — `PATCH /api/tickets/{{ticketUsableCode}}/use` — actor: STAFF — esperado: **409**
- [ ] **06-49 · E2E-TKT-05c · Cancelar T2 (ya usado) como USER_A** — `PATCH /api/tickets/{{ticketUsableCode}}/cancel` — actor: USER_A — esperado: **409**
- [ ] **06-50 · E2E-TKT-05d · Cancelar T3 (de B) como ADMIN** — `PATCH /api/tickets/{{ticketBCode}}/cancel` — actor: ADMIN — esperado: **200**
- [ ] **06-51 · E2E-TKT-05e · Releer T3 como USER_B** — `GET /api/tickets/{{ticketBCode}}` — actor: USER_B — esperado: **200**
- [ ] **06-52 · E2E-TKT-05f · Cancelar ticket inexistente como ADMIN** — `PATCH /api/tickets/NO-EXISTE-{{runId}}/cancel` — actor: ADMIN — esperado: **404**
- [ ] **06-53 · E2E-TKT-06d · Usar ticket inexistente como STAFF** — `PATCH /api/tickets/NO-EXISTE-{{runId}}/use` — actor: STAFF — esperado: **404**
- [ ] **06-54 · TC-BIZ-009c · Pagados al final del flujo** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: STAFF — esperado: **200**

### 07 Seguridad / escenarios negativos

- [ ] **07-01 · TC-AUTH-008 · /me con Bearer inventado** — `GET /api/auth/me` — actor: Token falso — esperado: **401**
- [ ] **07-02 · TC-AUTH-008b · /me con Bearer malformado (3 partes falsas)** — `GET /api/auth/me` — actor: Token falso — esperado: **401**
- [ ] **07-03 · TC-AUTH-009 · /me con JWT alterado** — `GET /api/auth/me` — actor: USER_A alterado — esperado: **401**
- [ ] **07-04 · TC-AUTH-010 · /me con JWT expirado** — `GET /api/auth/me` — actor: USER_A vencido — esperado: **401**
- [ ] **07-05 · TC-AUTH-011 · /me con JWT firmado con otra clave** — `GET /api/auth/me` — actor: Token forjado — esperado: **401**
- [ ] **07-06 · TC-AUTH-012 · Token enviado por query string** — `GET /api/auth/me?access_token={{userAToken}}` — actor: USER_A, mal enviado — esperado: **401**
- [ ] **07-07 · TC-AUTH-015 · Ruta pública con token inventado** — `GET /api/venues/active` — actor: Token falso — esperado: **200**
- [ ] **07-08 · TC-AUTH-015b · Borrador con token forjado (dice ser ADMIN)** — `GET /api/events/{{draftEventCode}}` — actor: Token forjado — esperado: **404**
- [ ] **07-09 · TC-AUTH-015c · Crear evento con token forjado** — `POST /api/events` — actor: Token forjado — esperado: **401**
- [ ] **07-10 · TC-AUTH-014 · Token de USER en endpoint de ADMIN** — `POST /api/events` — actor: USER_A — esperado: **403**
- [ ] **07-11 · TC-AUTH-013a · Login de inject_r01 (antes de desactivar)** — `POST /api/auth/login` — actor: inject_r01 — esperado: **200**
- [ ] **07-12 · TC-AUTH-013b · /me de inject_r01 con token vigente** — `GET /api/auth/me` — actor: inject_r01 — esperado: **200**
- [ ] **07-13 · TC-AUTH-013c · /me de inject_r01 DESPUÉS de desactivarlo** — `GET /api/auth/me` — actor: inject_r01 inactivo — esperado: **401**
- [ ] **07-14 · TC-AUTH-013d · Login de inject_r01 desactivado** — `POST /api/auth/login` — actor: inject_r01 inactivo — esperado: **401**
- [ ] **07-15 · TC-SEC-017a · Login STAFF (token fresco)** — `POST /api/auth/login` — actor: STAFF — esperado: **200**
- [ ] **07-16 · TC-SEC-017b · Pagados como STAFF (antes de revocar)** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: STAFF — esperado: **200**
- [ ] **07-17 · TC-SEC-017c · Pagados como STAFF DESPUÉS de revocar el rol** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: STAFF sin rol — esperado: **403**
- [ ] **07-18 · TC-SEC-017d · /me de STAFF sin rol** — `GET /api/auth/me` — actor: STAFF sin rol — esperado: **200 (se espera) con roles vacío**
- [ ] **07-19 · TC-SEC-017e · Pagados como STAFF DESPUÉS de restaurar el rol** — `GET /api/events/{{publishedEventCode}}/tickets/paid` — actor: STAFF restaurado — esperado: **200**

### 08 Validaciones y errores HTTP

- [ ] **08-01 · TC-HTTP · Registro con JSON roto** — `POST /api/users` — actor: ANONYMOUS — esperado: **400**
- [ ] **08-02 · TC-HTTP · Registro con email mal formado** — `POST /api/users` — actor: ANONYMOUS — esperado: **400**
- [ ] **08-03 · TC-HTTP · Registro con username de más de 50 caracteres** — `POST /api/users` — actor: ANONYMOUS — esperado: **400**
- [ ] **08-04 · TC-BIZ-006c · Registro con fecha de nacimiento futura** — `POST /api/users` — actor: ANONYMOUS — esperado: **409 (regla de negocio, no 400)**
- [ ] **08-05 · TC-HTTP · Login con password de 129 caracteres** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **400**
- [ ] **08-06 · TC-HTTP · Login con password de 100 caracteres** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **401 (no 500)**
- [ ] **08-07 · TC-HTTP · Ruta inexistente sin token** — `GET /api/no-existe` — actor: ANONYMOUS — esperado: **401 (toda ruta no pública exige token)**
- [ ] **08-08 · TC-HTTP · Ruta inexistente como ADMIN** — `GET /api/no-existe` — actor: ADMIN — esperado: **404 (lo esperable en una API REST)**
- [ ] **08-09 · TC-HTTP · Método no permitido (DELETE) como ADMIN** — `DELETE /api/venues/active` — actor: ADMIN — esperado: **405 (lo esperable)**
- [ ] **08-10 · TC-HTTP · Content-Type no soportado en login (text/plain)** — `POST /api/auth/login` — actor: ANONYMOUS — esperado: **415 (lo esperable)**

### 09 Flujos de negocio / secuencia recomendada

- [ ] **09-01 · TC-BIZ-014a · Crear evento con edad mínima 18** — `POST /api/events` — actor: ADMIN — esperado: **201**
- [ ] **09-02 · TC-BIZ-014b · Publicar evento de edad mínima** — `PATCH /api/events/E2E-AGE-{{runId}}/publish` — actor: ADMIN — esperado: **200**
- [ ] **09-03 · TC-BIZ-014c · Registrar usuario menor de edad** — `POST /api/users` — actor: ANONYMOUS — esperado: **201**
- [ ] **09-04 · TC-BIZ-014d · Login del menor** — `POST /api/auth/login` — actor: Menor — esperado: **200**
- [ ] **09-05 · TC-BIZ-014e · Menor intenta comprar (edad insuficiente)** — `POST /api/tickets` — actor: Menor — esperado: **409**
- [ ] **09-06 · TC-BIZ-014f · Adulto (USER_A) compra el mismo evento** — `POST /api/tickets` — actor: USER_A — esperado: **201**
- [ ] **09-07 · TC-BIZ-014g · Crear evento en venue de capacidad 1** — `POST /api/events` — actor: ADMIN — esperado: **201**
- [ ] **09-08 · TC-BIZ-014h · Publicar evento de aforo 1** — `PATCH /api/events/E2E-SMALL-{{runId}}/publish` — actor: ADMIN — esperado: **200**
- [ ] **09-09 · TC-BIZ-014i · USER_A compra el único cupo** — `POST /api/tickets` — actor: USER_A — esperado: **201**
- [ ] **09-10 · TC-BIZ-014j · Releer el evento como ADMIN** — `GET /api/events/E2E-SMALL-{{runId}}` — actor: ADMIN — esperado: **200**
- [ ] **09-11 · TC-BIZ-014k · USER_B intenta comprar con el aforo lleno** — `POST /api/tickets` — actor: USER_B — esperado: **409**
- [ ] **09-12 · OBS-01 · Evento SOLD_OUT visto por un anónimo** — `GET /api/events/E2E-SMALL-{{runId}}` — actor: ANONYMOUS — esperado: **404 (comportamiento actual)**
- [ ] **09-13 · OBS-02 · Listado público con evento agotado** — `GET /api/events/published` — actor: ANONYMOUS — esperado: **200**
- [ ] **09-14 · TC-BIZ-014l · Cancelar el ticket del aforo lleno** — `PATCH /api/tickets/{{ticketSmallCode}}/cancel` — actor: USER_A — esperado: **200**
- [ ] **09-15 · OBS-03 · Releer el evento tras cancelar** — `GET /api/events/E2E-SMALL-{{runId}}` — actor: ADMIN — esperado: **200**
- [ ] **09-16 · OBS-04 · USER_B intenta comprar tras la cancelación** — `POST /api/tickets` — actor: USER_B — esperado: **409 (consecuencia de OBS-03)**

## Al terminar

- [ ] Cada petición tiene resultado en `registro-ejecucion-manual.md` (PASS / FAIL / BLOCKED / NOT RUN).
- [ ] Los 500 inesperados están registrados como defecto.
- [ ] Ningún token ni contraseña quedó en archivos, capturas ni en el repositorio.
- [ ] `matriz-cobertura.md` revisada: 22/22 rutas con caso nominal.