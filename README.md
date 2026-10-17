Calixto Diaz 2023214059 ----- ----- ----- Keyder Granados 2023214035

# PulsePass — Fase 4: Capa de Seguridad

Rama: `feature/capa-security`

Esta fase agrega autenticación y autorización a la API REST de la Fase 3 con **Spring Security** y **JWT firmado (JJWT)**. No cambia las reglas de negocio ni las 20 operaciones existentes: añade un perímetro HTTP seguro, credenciales con hash BCrypt, tres roles (`USER`, `STAFF`, `ADMIN`) y comprobaciones de propiedad para que nadie opere sobre recursos ajenos.

```
HTTP Request -> JwtAuthenticationFilter -> reglas de rutas (SecurityConfig)
             -> Controller -> Service (@PreAuthorize + AuthorizationService)
             -> Repository -> PostgreSQL

Sin identidad válida  -> RestAuthenticationEntryPoint -> 401
Identidad sin permiso -> RestAccessDeniedHandler / GlobalExceptionHandler -> 403
```

Evolución por fases: Fase 1 Persistencia -> Fase 2 Servicios -> Fase 3 Controladores REST -> **Fase 4 Seguridad**.

## Tecnologías

Java 21, Spring Boot 4.1.1, Spring Security, JJWT 0.13.0 (HS256), BCrypt, Spring Data JPA, PostgreSQL, Flyway (migraciones V1 a V4), JUnit 5, Mockito, MockMvc, `spring-security-test` y Testcontainers.

## Estructura de esta fase

```
src/main/java/com/example/taller_persisntencia2
├── controller
│   └── AuthController            (NUEVO: login y /me)
├── service
│   ├── AuthService               (NUEVO: registro atómico, login, usuario actual)
│   └── AuthorizationService      (NUEVO: propiedad de recursos y visibilidad)
├── security                      (NUEVO)
│   ├── SecurityConfig            (cadena de filtros, rutas, sin sesión)
│   ├── JwtProperties / JwtConfig (configuración y reloj inyectable)
│   ├── JwtService                (emite y valida el JWT)
│   ├── JwtAuthenticationFilter   (lee el Bearer y construye la identidad)
│   ├── CustomUserDetailsService  (carga usuario, hash, roles y estado)
│   ├── SecurityPrincipal         (identidad autenticada, con id persistente)
│   ├── PasswordConfig / AuthenticationConfig
│   ├── RestAuthenticationEntryPoint   (401 en JSON)
│   ├── RestAccessDeniedHandler        (403 en JSON)
│   └── SecurityErrorWriter       (mismo ErrorResponse de seis campos)
├── domain
│   └── Role, UserCredential, UserRole, UserRoleId   (NUEVO)
├── repository
│   └── UserCredentialRepository, UserRoleRepository, AuthUserRow   (NUEVO)
├── dto
│   ├── request   (LoginRequest; RegisterUserRequest ahora incluye password)
│   └── response  (AuthResponse, AuthenticatedUserResponse)
├── validation    (MaxUtf8Bytes: límite de 72 bytes para BCrypt)
└── exception     (InvalidTokenException; GlobalExceptionHandler maneja 401 y 403)

src/main/resources/db/migration
└── V4__security_credentials_roles.sql

src/test/java/com/example/taller_persisntencia2
├── controller   (un test por controller, SecurityMatrixTest, AuthControllerTest)
├── security     (JwtServiceTest, JwtAuthenticationFilterTest, CustomUserDetailsServiceTest)
├── service/impl (AuthServiceImplTest, AuthorizationServiceImplTest, ...)
└── *IT          (integración con PostgreSQL: AuthLoginIT, AuthRegistrationIT,
                  OwnershipSecurityIT, SecurityChainIT, SecurityMigrationIT, ...)
```

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PULSEPASS_JWT_SECRET_BASE64` | Sí | Clave HS256: Base64 de al menos 32 bytes aleatorios. La aplicación no arranca si falta o es corta. |
| `PULSEPASS_JWT_ISSUER` | No | Emisor del token. Por defecto `pulsepass-api`. |
| `DB_USERNAME` | No | Usuario de PostgreSQL. Por defecto `postgres`. |
| `DB_PASSWORD` | No | Contraseña de PostgreSQL. Por defecto `postgres` (solo desarrollo local). |

`.env.example` es una plantilla sin secretos. El archivo `.env` está en `.gitignore`: nunca lo subas al repositorio. Spring no lee `.env` por sí solo, así que las variables se definen en la terminal o en la configuración de ejecución del IDE.

La duración del token (`pulsepass.security.jwt.access-token-ttl`, por defecto `PT15M`) se cambia en `application.properties`.

Generar la clave en PowerShell:

```powershell
$b = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($b)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($b)
```

Usa una clave distinta en cada entorno. Las pruebas usan su propia clave ficticia en `src/test/resources`.

## Ejecutar la aplicación

Requisitos: Java 21 y una base PostgreSQL llamada `pulsepass` en `localhost:5432`.

1. Crear la base (una sola vez): `CREATE DATABASE pulsepass;`
2. Definir `PULSEPASS_JWT_SECRET_BASE64` en la misma terminal (ver arriba).
3. Ejecutar:

```
.\mvnw.cmd spring-boot:run
```

Flyway aplica las migraciones V1 a V4 al arrancar.

### Verificación rápida (PowerShell)

```powershell
$base = "http://localhost:8080"

# 1) Registro: rol USER, contraseña de al menos 12 caracteres
$registro = @{
  username  = "andrea"
  email     = "andrea@example.com"
  firstName = "Andrea"
  lastName  = "Gomez"
  birthDate = "1998-04-12"
  password  = "UnaFraseSeguraLarga2026!"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/api/users" -ContentType "application/json" -Body $registro

# 2) Login: devuelve accessToken, tokenType y expiresIn (900 segundos)
$login = @{ identifier = "andrea"; password = "UnaFraseSeguraLarga2026!" } | ConvertTo-Json
$token = (Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType "application/json" -Body $login).accessToken

# 3) Usuario autenticado
Invoke-RestMethod -Uri "$base/api/auth/me" -Headers @{ Authorization = "Bearer $token" }

# 4) Un USER no puede publicar eventos: responde 403
Invoke-RestMethod -Method Patch -Uri "$base/api/events/CMF-2026/publish" -Headers @{ Authorization = "Bearer $token" }
```

Sin el header `Authorization` en una ruta protegida la respuesta es 401. Un token alterado o vencido también responde 401.

## Seguridad

### Cómo funciona

- **API sin estado (stateless):** no hay sesión ni cookies de autenticación. Cada request envía `Authorization: Bearer <token>`. Por eso CSRF está deshabilitado.
- **JWT HS256 de 15 minutos.** Claims: `sub` (id persistente del usuario), `iss`, `iat`, `exp` y `jti`. No contiene roles ni datos personales. Se rechazan tokens vencidos, manipulados, de otro emisor, malformados o con otro algoritmo.
- **Solo por header.** Un token en la URL se ignora. Si llegan dos headers `Authorization`, no se autentica. Un Bearer inválido nunca concede acceso.
- **El estado y los roles se leen de la base de datos en cada request.** Un usuario desactivado pierde el acceso en el siguiente request, y un rol retirado deja de valer sin esperar a que el token venza.
- **Contraseñas con BCrypt.** Mínimo 12 caracteres y máximo 72 bytes. Nunca se guardan ni se registran en texto plano; el hash nunca sale en una respuesta.
- **Login por usuario o por correo.** Cualquier fallo (usuario inexistente, contraseña incorrecta, usuario inactivo, usuario sin credenciales) responde el mismo 401 genérico, para no revelar si la cuenta existe.
- **Registro:** `POST /api/users` crea el usuario, su perfil, el hash y el rol `USER` en **una sola transacción**. El rol nunca viene del cliente.
- **Autorización en dos capas:** reglas por ruta en `SecurityConfig` y reglas por método (`@PreAuthorize`) en las interfaces de los Services, apoyadas en `AuthorizationService`, que compara siempre con el **id persistente** del usuario autenticado, no con un id o correo enviado por el cliente.
- Se registran los logins correctos y fallidos (sin credenciales) y las denegaciones 401/403 (método y ruta, sin token).

### Modelo de datos (migración V4)

| Tabla | Columnas | Notas |
|---|---|---|
| `user_credentials` | `user_id` (PK y FK), `password_hash`, `password_changed_at` | Relación 1:1 con `users`. El hash vive aparte para que ningún DTO lo exponga por accidente. |
| `user_roles` | `user_id`, `role` (PK compuesta) | `role` restringido a `USER`, `STAFF`, `ADMIN` con `CHECK`. |

Los usuarios anteriores a esta fase no tienen credenciales ni roles: no pueden iniciar sesión hasta una activación segura. No se inventó ninguna contraseña por defecto.

### Endpoints nuevos

| Método | Ruta | Acceso | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/auth/login` | Público | 200 `{accessToken, tokenType, expiresIn}` | 400, 401 |
| GET | `/api/auth/me` | Autenticado | 200 `{id, username, roles}` | 401 |

`POST /api/users` cambia su contrato de entrada: ahora exige `password`. La respuesta (`UserResponse`) sigue siendo la misma y no incluye la contraseña ni el hash. El registro no devuelve token: el flujo es **registrarse -> iniciar sesión -> usar el token**.

### Permisos de las 20 operaciones

| Operación | Acceso |
|---|---|
| `GET /api/venues/{code}`, `GET /api/venues/active` | Público |
| `GET /api/artists/{id}`, `/by-stage-name`, `/active` | Público |
| `GET /api/events/published` | Público |
| `GET /api/events/{eventCode}`, `GET /api/events/by-artist` | Público solo para eventos publicados; el resto de estados, STAFF o ADMIN |
| `POST /api/events` | ADMIN |
| `PATCH /api/events/{eventCode}/publish` | ADMIN |
| `POST /api/events/{eventCode}/artists/{artistId}` | ADMIN |
| `POST /api/users` | Público (siempre rol `USER`) |
| `GET /api/users/by-email`, `GET /api/users/by-username` | El propio usuario o ADMIN |
| `POST /api/tickets` | USER, y el `userEmail` debe ser el suyo |
| `GET /api/tickets/{ticketCode}` | Dueño, STAFF o ADMIN |
| `GET /api/tickets/by-user` | El propio usuario o ADMIN |
| `PATCH /api/tickets/{ticketCode}/cancel` | Dueño o ADMIN |
| `GET /api/events/{eventCode}/tickets/paid` | STAFF o ADMIN |
| `PATCH /api/tickets/{ticketCode}/use` | STAFF o ADMIN |

### Políticas de propiedad

- **Ticket ajeno -> 404.** Consultar o cancelar un ticket de otra persona responde igual que si el ticket no existiera, para no revelar que existe.
- **Correo o usuario ajeno -> 403** (`by-email`, `by-username`, `by-user`, y compra con el correo de otro). La respuesta es la misma exista o no ese correo.
- **Evento no publicado -> 404** para anónimos y para `USER`: es como si no existiera. STAFF y ADMIN sí lo ven.
- STAFF puede consultar tickets y marcarlos como usados, pero no puede cancelar tickets de otros.

### Roles de prueba

El registro público solo crea usuarios `USER`. Los roles `STAFF` y `ADMIN` se asignan por un proceso administrativo, nunca por HTTP. Para el desarrollo local: registra primero al usuario con `POST /api/users` y luego asígnale el rol con SQL (por ejemplo desde `psql` o DBeaver):

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE username = 'tu_usuario';
```

Usa `'STAFF'` para personal de operación. El rol se aplica en el siguiente request, sin necesidad de volver a iniciar sesión, porque los roles se leen de la base en cada solicitud.

## Endpoints

Los 20 métodos públicos de los Services tienen un endpoint. Las URL, los verbos y las respuestas exitosas son los de la Fase 3. La columna **Acceso** resume el permiso; el detalle está en la sección Seguridad.

### Venues

| Método | Ruta | Acceso | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/venues/{code}` | Público | 200 | 404 |
| GET | `/api/venues/active` | Público | 200 | — |

### Eventos

| Método | Ruta | Acceso | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/events` | ADMIN | 201 | 400, 401, 403, 404, 409 |
| GET | `/api/events/{eventCode}` | Público si está publicado | 200 | 404 |
| GET | `/api/events/published` | Público | 200 | — |
| PATCH | `/api/events/{eventCode}/publish` | ADMIN | 200 | 401, 403, 404, 409 |
| POST | `/api/events/{eventCode}/artists/{artistId}` | ADMIN | 200 | 400, 401, 403, 404, 409 |
| GET | `/api/events/by-artist?stageName=...` | Público (solo publicados) | 200 | 400 |

### Artistas

| Método | Ruta | Acceso | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/artists/{id}` | Público | 200 | 400, 404 |
| GET | `/api/artists/by-stage-name?stageName=...` | Público | 200 | 400, 404 |
| GET | `/api/artists/active` | Público | 200 | — |

### Usuarios

| Método | Ruta | Acceso | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/users` | Público | 201 | 400, 409 |
| GET | `/api/users/by-email?email=...` | Propio usuario o ADMIN | 200 | 400, 401, 403, 404 |
| GET | `/api/users/by-username?username=...` | Propio usuario o ADMIN | 200 | 400, 401, 403, 404 |

### Tickets

| Método | Ruta | Acceso | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/tickets` | USER (correo propio) | 201 | 400, 401, 403, 404, 409 |
| GET | `/api/tickets/{ticketCode}` | Dueño, STAFF o ADMIN | 200 | 401, 404 |
| GET | `/api/tickets/by-user?email=...` | Propio usuario o ADMIN | 200 | 400, 401, 403 |
| GET | `/api/events/{eventCode}/tickets/paid` | STAFF o ADMIN | 200 | 401, 403, 404 |
| PATCH | `/api/tickets/{ticketCode}/cancel` | Dueño o ADMIN | 200 | 401, 404, 409 |
| PATCH | `/api/tickets/{ticketCode}/use` | STAFF o ADMIN | 200 | 401, 403, 404, 409 |

**Nota de diseño:** `GET /api/events/{eventCode}/tickets/paid` está implementado en `TicketController` (con `@RequestMapping("/api")`), no en `EventController`. La URL es la que define el contrato, pero así `EventController` no depende de `TicketService` y cada controller solo conoce el Service que necesita.

## Códigos HTTP

| Código | Uso |
|---|---|
| 200 | Consultas y actualizaciones correctas |
| 201 | Creación de evento, usuario o ticket |
| 400 | Request inválido o mal formado (Bean Validation, JSON inválido, parámetro faltante, tipo de ruta inválido) |
| 401 | Falta una identidad válida: sin token, token vencido o manipulado, o login incorrecto |
| 403 | Identidad válida, pero sin permiso para la operación |
| 404 | Recurso inexistente (`ResourceNotFoundException`), o recurso ajeno que no debe revelarse (ticket de otro, evento sin publicar) |
| 409 | Duplicado (`DuplicateResourceException`) o regla de negocio incumplida (`BusinessRuleException`) |
| 500 | Error inesperado; el cliente recibe un mensaje genérico y el detalle solo se registra en el log |

## Formato de errores

Todos los errores usan `ErrorResponse`, también los 401 y 403 que se producen dentro del filtro de seguridad (antes de llegar a Spring MVC):

```java
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> details
) {}
```

Ejemplo 404:

```json
{
  "timestamp": "2026-10-11T14:52:27",
  "status": 404,
  "error": "Not Found",
  "message": "Event not found: CMF-2026",
  "details": {}
}
```

Ejemplo 400 por validación:

```json
{
  "timestamp": "2026-10-11T14:52:27",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": {
    "eventCode": "Event code is required",
    "venueCode": "Venue code is required"
  }
}
```

Ejemplo 401 (sin token o token inválido):

```json
{
  "timestamp": "2026-10-17T10:15:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Autenticación requerida",
  "details": {}
}
```

Ejemplo 403:

```json
{
  "timestamp": "2026-10-17T10:15:00",
  "status": 403,
  "error": "Forbidden",
  "message": "No tiene permisos para realizar esta operación",
  "details": {}
}
```

El manejo de excepciones de negocio y de validación está centralizado en `GlobalExceptionHandler`. Los 401 y 403 originados en el filtro los escriben `RestAuthenticationEntryPoint` y `RestAccessDeniedHandler` con la misma estructura. Ninguna respuesta incluye trazas, contraseñas, hashes ni tokens.

## Ejecutar las pruebas

Los comandos usan el Maven Wrapper. En Windows se usa `.\mvnw.cmd`; en Linux o Mac, `./mvnw`.

Suite completa (**244 tests**). Requiere Docker encendido, porque los tests de integración usan Testcontainers con PostgreSQL:

```
.\mvnw.cmd clean test
```

Solo las pruebas que no necesitan base de datos (unitarias y de controller con `@WebMvcTest`):

```
.\mvnw.cmd test "-Dtest=!*IT,!TallerPersisntencia2ApplicationTests,!VenuePersistenceTest"
```

Una clase individual:

```
.\mvnw.cmd test -Dtest=SecurityMatrixTest
```

| Tipo | Clases | Qué verifican |
|---|---|---|
| Unitarias (JUnit 5 y Mockito) | `JwtServiceTest`, `JwtAuthenticationFilterTest`, `CustomUserDetailsServiceTest`, `AuthServiceImplTest`, `AuthorizationServiceImplTest`, `EventServiceImplTest`, `TicketServiceImplTest`, `UserServiceImplTest` | Firma, vencimiento, emisor y manipulación del JWT; filtro Bearer; propiedad de recursos; registro y login |
| Controller con seguridad real (MockMvc) | `*ControllerTest`, `SecurityMatrixTest`, `GlobalExceptionHandlerTest` | Códigos 200/201/400/401/403/404/409 y la matriz de las 20 rutas por anónimo, USER, STAFF y ADMIN, sin deshabilitar los filtros |
| Integración con PostgreSQL (Testcontainers) | `*IT` (`SecurityMigrationIT`, `AuthLoginIT`, `AuthRegistrationIT`, `OwnershipSecurityIT`, `SecurityChainIT`, `CustomUserDetailsServiceIT` y las de persistencia) | Migración V4, restricciones de la base, registro atómico, login real, tokens vencidos o alterados, usuario desactivado y propiedad de tickets |

## Validación de entrada

Bean Validation cubre solo lo estructural (campos obligatorios, formato de email, valor mínimo, longitud máxima de `description`: 1000, y contraseña de entre 12 caracteres y 72 bytes). Las reglas de negocio (usuario activo, evento publicado, edad mínima, capacidad, transiciones de estado, duplicados) permanecen en la capa Service. La autorización (quién puede hacer qué) vive en `SecurityConfig` y en `AuthorizationService`, separada de las reglas de negocio.

## Limitaciones conocidas (Fase 4)

Este es un MVP académico, no un sistema listo para producción. No están implementados:

- **Límite de intentos de login** ni protección contra fuerza bruta.
- **Refresh tokens ni revocación de tokens:** un token robado sigue válido hasta que vence (15 minutos). Cerrar sesión en el cliente solo borra su copia.
- **Rotación automática de la clave JWT** ni gestor de secretos.
- **CORS:** no está configurado porque no hay frontend.
- **Request ID** en los logs.
- **STAFF es global:** puede operar tickets de cualquier evento, porque el dominio aún no asigna personal a eventos. En producción habría que restringirlo.
- **Usuarios anteriores a la Fase 4:** quedaron sin contraseña y sin roles, así que no pueden iniciar sesión hasta una activación segura. Si se les asigna una credencial a mano, también hay que insertarles su rol en `user_roles`.
- **No existe registro público de STAFF ni de ADMIN.** Se asignan por un proceso administrativo (ver "Roles de prueba").
- **HTTPS:** la aplicación no lo configura. Fuera de localhost y de entornos de laboratorio aislados debe ir detrás de HTTPS.

## Fuera de alcance

Paginación, versionado de la API (`/api/v1`), OpenAPI, pruebas E2E, OAuth2, SSO, MFA, recuperación de contraseña por correo y cambio de contraseña.

## Notas conocidas

- Los mensajes de error de los Services están en español (por ejemplo `"Usuario no encontrado"`), mientras que los de validación de los DTOs están en inglés. La API responde en ambos idiomas hasta que se unifiquen.
- El límite de 1000 caracteres de `description` es una decisión de API: la columna es `TEXT` y no impone límite en la base de datos.
- El tiempo de vida del token y el emisor son configurables, pero la clave es obligatoria: la aplicación falla al arrancar si `PULSEPASS_JWT_SECRET_BASE64` falta, no es Base64 válido o mide menos de 32 bytes.