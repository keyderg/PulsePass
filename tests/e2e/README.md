# Pruebas E2E manuales con Postman — PulsePass

Colección Postman v2.1 **sin scripts**, ejecutada a mano con *Send* contra la API real y PostgreSQL real. Cubre las 22 rutas (20 de negocio + `POST /api/auth/login` y `GET /api/auth/me`), los roles ANONYMOUS, USER, STAFF y ADMIN, propiedad de recursos, JWT y errores.

Archivos: `postman/` (colección y ambiente), `fixtures/` (seed y notas), `checklist-e2e-manual.md`, `registro-ejecucion-manual.md`, `matriz-cobertura.md`.

> Rama de trabajo sugerida: `feature/pruebas-e2e`, creada desde la rama que ya integra la capa de seguridad.

## 1. Requisitos

Java 21, Docker Desktop, IntelliJ IDEA (o terminal con `mvnw`), Postman Desktop y la imagen `postgres:18-alpine` (se descarga sola).

## 2. Preparar la base de pruebas

```
docker run -d --name pulsepass-e2e-db -e POSTGRES_PASSWORD=<CLAVE_DB> -e POSTGRES_DB=pulsepass_e2e -p 5432:5432 postgres:18-alpine
docker ps
```
Reemplaza `<CLAVE_DB>` por una clave tuya, **sin** los símbolos `< >`. `docker ps` debe mostrar `pulsepass-e2e-db` en `Up`. Si el puerto 5432 está ocupado, cambia el primer número de `-p`.

## 3. Generar la clave JWT (solo E2E)

```
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```
Guárdala fuera del repositorio. No la pegues en chats ni archivos.

## 4. Arrancar la app contra la base E2E

En IntelliJ: *Run → Edit Configurations*, selecciona la clase `TallerPersisntencia2Application` y abre *Environment variables*. **Desmarca "Store as project file"** para que no se guarden en `.idea`.

| Variable | Valor |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/pulsepass_e2e` |
| `DB_PASSWORD` | la `<CLAVE_DB>` del paso 2 |
| `PULSEPASS_JWT_SECRET_BASE64` | la clave del paso 3 |
| `SPRING_PROFILES_ACTIVE` | `local` |
| `PULSEPASS_BOOTSTRAP_ADMIN_PASSWORD` | clave de 12+ caracteres (usuario `admin`) |
| `PULSEPASS_BOOTSTRAP_STAFF_PASSWORD` | clave de 12+ caracteres (usuario `laura`) |

Arranca y busca en el log: `seed_created username=admin role=ADMIN` y `seed_created username=laura role=STAFF`. Si aparece `seed_skipped`, alguna clave tiene menos de 12 caracteres.

## 5. Cargar los venues

```
Get-Content tests/e2e/fixtures/seed-e2e.sql | docker exec -i pulsepass-e2e-db psql -U postgres -d pulsepass_e2e
```
Debe responder `INSERT 0 3`. Ejecutarlo una sola vez.

## 6. Importar en Postman

1. *Import* → `postman/PulsePass-Manual-E2E.postman_collection.json` y `postman/PulsePass-local.postman_environment.json`.
2. Selecciona el ambiente **PulsePass local E2E**.
3. En el ambiente, llena la columna **Value** (la local; nunca *Shared Value*) de: `userAPassword`, `userBPassword` (12+ caracteres), `adminPassword` y `staffPassword` (las del paso 4).
4. Variables que se crean vacías y las llenas tú durante la prueba: tokens (`userAToken`, `userBToken`, `adminToken`, `staffToken`, `injectToken`, `minorToken`), `expiredToken`, `tamperedToken`, `forgedToken`, `ticketCancelableCode`, `ticketUsableCode`, `ticketBCode`, `ticketSmallCode` y `artistId`.

Si importas el ambiente y alguna variable falta, créala a mano con el mismo nombre.

## 7. Ejecutar

Carpetas 00 a 09, **en orden**, cada petición con *Send*. La descripción de cada una (ícono de libro) trae actor, precondiciones, HTTP esperado y qué revisar. Anota en `registro-ejecucion-manual.md`.

- **Tokens:** tras cada login con 200, copia solo el valor de `accessToken` (doble clic en el texto para seleccionarlo sin comillas) a la columna **Value** de la variable y guarda con `Ctrl+S`. Duran 15 minutos: si una petición da 401 inesperado, repite el login.
- **Códigos de ticket:** 06-01, 06-02 y 06-03 devuelven `ticketCode`; cópialos a `ticketCancelableCode`, `ticketUsableCode` y `ticketBCode`. 09-09 → `ticketSmallCode`.
- **`artistId`:** el `id` de Solar Beat en `GET /api/artists/active`.

### Pasos con SQL en la carpeta 07

Siempre contra `pulsepass_e2e`:

```
# Antes de 07-13: desactivar a inject_r01   (esperar: UPDATE 1)
docker exec -i pulsepass-e2e-db psql -U postgres -d pulsepass_e2e -c "UPDATE users SET active=false WHERE username='inject_r01';"

# Antes de 07-17: revocar el rol STAFF de laura   (esperar: DELETE 1)
docker exec -i pulsepass-e2e-db psql -U postgres -d pulsepass_e2e -c "DELETE FROM user_roles WHERE user_id=(SELECT id FROM users WHERE username='laura');"

# Antes de 07-19: RESTAURAR el rol STAFF   (esperar: INSERT 0 1)
docker exec -i pulsepass-e2e-db psql -U postgres -d pulsepass_e2e -c "INSERT INTO user_roles (user_id, role) SELECT id,'STAFF' FROM users WHERE username='laura';"
```

### Tokens especiales de la carpeta 07

- `expiredToken`: un token de USER_A con más de 15 minutos de antigüedad (el que dio 200 antes y ahora da 401).
- `tamperedToken`: copia de `userAToken` con **un carácter cambiado en medio de la tercera parte** (la firma). No cambies el último carácter.
- `forgedToken`: token firmado con una clave desechable que no pertenece a la app (dice ser el usuario 1 y vence en 2030). Inofensivo; debe dar 401:
  ```
  eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaXNzIjoicHVsc2VwYXNzLWFwaSIsImlhdCI6MTc5MjM4MDAwMCwiZXhwIjoxODkzNDU2MDAwLCJqdGkiOiJmb3JqYWRvLWUyZSJ9.VYET5XucTjcd694azFbc7Qd5o-bWmxoGccWAI5W1R5A
  ```

## 8. Criterios

- **PASS:** HTTP, JSON y condición de negocio/seguridad coinciden con lo esperado.
- **FAIL:** algo no coincide, o hay un 500 inesperado.
- **BLOCKED:** falta un fixture, actor, token o respuesta previa. Nunca se marca como aprobado.
- Un 2xx por sí solo no basta: revisar el body y, en denegaciones sobre recursos, un GET posterior que confirme que no hubo cambios.

## 9. Repetir las pruebas

Los códigos de evento y usuarios son únicos. Para repetir: `docker rm -f pulsepass-e2e-db`, repetir los pasos 2, 4 y 5 (los usuarios USER_A, USER_B, etc. se vuelven a registrar en la carpeta 03); o bien cambiar `runId` y los usuarios y códigos de evento del ambiente. Nunca borres datos de otras bases.

## 10. Seguridad de secretos

No versionar contraseñas, tokens ni la clave JWT. No dejar valores en *Shared Value* ni exportar el ambiente con secretos. No adjuntar tokens en capturas ni en la bitácora.

## 11. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `Connection refused` en IntelliJ o la app | Docker apagado o contenedor detenido: `docker start pulsepass-e2e-db` |
| `password authentication failed` | La clave de `DB_PASSWORD` o de IntelliJ no es la del `docker run` (revisa que no tenga `< >`) |
| La app no arranca por `secret-base64` | Falta `PULSEPASS_JWT_SECRET_BASE64` en la configuración de arranque |
| `seed_skipped` en el log | Clave de admin o staff de menos de 12 caracteres |
| 401 con `Autenticación requerida` en una petición con token | Variable de token vacía, token vencido o ambiente no seleccionado |
| 409 al crear eventos o usuarios | Ya existen de una corrida anterior: cambiar `runId` o reiniciar la base |