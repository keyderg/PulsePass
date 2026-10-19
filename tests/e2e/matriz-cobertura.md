# Matriz de cobertura — 22 rutas × roles

Leyenda: código HTTP = ejecutado y coincide con lo esperado · **pend.** = caso creado en la colección pero sin resultado confirmado · — = no aplica o no se probó.
Los permisos salen de `SecurityConfig` y de los `@PreAuthorize` de los services. "Ajeno" = USER_B sobre recursos de USER_A.

| # | Ruta | Anónimo | USER_A | USER_B | STAFF | ADMIN | Casos principales |
|---|---|---|---|---|---|---|---|
| 1 | `GET /api/venues/{code}` | 200  | — | — | — | — | 01 (E2E-VEN-01, 01b) |
| 2 | `GET /api/venues/active` | 200 | — | — | — | — | 00, 01 |
| 3 | `GET /api/artists/{id}` | 200 ; 404 y 400  | — | — | — | — | 02 (E2E-ART-01, 01b, 01c) |
| 4 | `GET /api/artists/by-stage-name` | 200 ; 400 | — | — | — | — | 02 (E2E-ART-02, 02b) |
| 5 | `GET /api/artists/active` | 200 | — | — | — | — | 02 |
| 6 | `POST /api/events` | 401 | 403 | — | 403 | 201 | 05-01 a 05-12, 07-09, 07-10 |
| 7 | `GET /api/events/{eventCode}` | publicado 200; borrador 404 | borrador 404 | — | borrador 200 | borrador 200 | 05-13 a 05-17, 05-36, 07-08 |
| 8 | `GET /api/events/published` | 200 (sin borradores) | — | — | — | — | 05-18, 05-37, OBS-02 |
| 9 | `PATCH /api/events/{eventCode}/publish` | 401 | 403 | — | 403 | 200 (409 repetido, 404 inexistente) | 05-28 a 05-35 |
| 10 | `POST /api/events/{eventCode}/artists/{artistId}` | 401 | 403 | — | 403 | 200 (409 repetido, 404) | 05-19 a 05-25 |
| 11 | `GET /api/events/by-artist` | 200 sin borrador | — | — | — | 200 con borrador | 05-26, 05-27, 05-38 |
| 12 | `POST /api/users` | 201 / 400 / 409 | — | — | — | — | 03, 08-01 a 08-04 |
| 13 | `GET /api/users/by-email` | 401 | 200 (propio) | 403 ajeno | 403 | 200; 404 inexistente | 04-01 a 04-07 |
| 14 | `GET /api/users/by-username` | 401 | 200 (propio) | 403 ajeno | 403 | 200; 404 inexistente | 04-08 a 04-14 |
| 15 | `POST /api/tickets` | 401 | 201 (propio); 403 con email ajeno | 201 (propio) | 403 | 403 | 06-01 a 06-13, 09 |
| 16 | `GET /api/tickets/{ticketCode}` | 401 | 200 (dueño); 403 ajeno | 403 ajeno | 200 | 200 | 06-14 a 06-21 |
| 17 | `GET /api/tickets/by-user` | 401 | 200 (propio) | 403 ajeno | 403 | 200 | 06-22 a 06-27 |
| 18 | `GET /api/events/{eventCode}/tickets/paid` | 401 | 403 | — | 200 | 200 | 06-28 a 06-32, 07-15 a 07-19 |
| 19 | `PATCH /api/tickets/{ticketCode}/cancel` | 401 | 200 (dueño) | 403 ajeno | 403 | 200 | 06-33 a 06-51 |
| 20 | `PATCH /api/tickets/{ticketCode}/use` | 401 | 403 | 403 | 200 | — no probado | 06-36 a 06-49 |
| 21 | `POST /api/auth/login` | 200 / 401 / 400 | — | — | — | — | 03, 07, 08-05, 08-06 |
| 22 | `GET /api/auth/me` | 401 | 200 | 200 | 200 | 200 | 03, 07 |

## Estado de cobertura

- **22 rutas con caso en la colección:** sí.
- **Rutas con caso nominal confirmado:** 22 de 22. 
- **Matriz de seguridad (IDOR, roles, JWT, usuario inactivo, rol revocado):** ejecutada y sin hallazgos de seguridad.
- **Huecos conocidos:** ADMIN marcando un ticket como usado (ruta 20) no tiene caso; STAFF sí.
- **Hallazgo abierto:** DEF-001 (08-08 a 08-10 devuelven 500).