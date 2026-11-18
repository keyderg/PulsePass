# Fixtures E2E

| Fixture | Origen |
|---|---|
| 3 venues (`E2E-VEN-ACTIVE` cap. 500, `E2E-VEN-SMALL` cap. 1, `E2E-VEN-OFF` inactivo) | `seed-e2e.sql`, a mano, una vez |
| 5 artistas activos (Solar Beat, Neon Waves, Caribbean Sound, Ocean Drive, Digital Pulse) | Migración Flyway V2 |
| ADMIN (`admin`, rol solo ADMIN) y STAFF (`laura`, rol solo STAFF) | `LocalAccountsSeeder` (perfil `local`), con las claves de las variables de entorno |
| USER_A, USER_B, `inject_r01`, `minor_<runId>` | Registro público por la API (carpetas 03 y 09) |
| Eventos, tickets | Creados por la API durante la prueba |

Reglas:
- Solo contra la base `pulsepass_e2e`. Nunca contra desarrollo, QA o producción.
- El seed no contiene contraseñas ni hashes. Las claves viven en variables de entorno de la ejecución.
- Partir de datos limpios: `docker rm -f pulsepass-e2e-db` y repetir la preparación del README. Alternativa: cambiar `runId` y los códigos de evento del ambiente.