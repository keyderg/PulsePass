Calixto Diaz 2023214059 ----- ----- ----- Keyder Granados 2023214035

# PulsePass — Fase 3: Capa de Controladores 

Rama: `feature/capa-controller`

Esta fase expone mediante una API REST los casos de uso que ya existían en las capas de Persistencia (Fase 1) y Servicios (Fase 2). No agrega reglas de negocio ni modifica el modelo: el Controller traduce HTTP a llamadas al Service, y las respuestas o excepciones del Service a respuestas HTTP.

```
HTTP Request -> Controller -> Service -> Repository -> PostgreSQL
HTTP Response <- Controller / GlobalExceptionHandler <- Service (respuesta o excepción)
```

## Tecnologías

Java 21, Spring Boot 4.1.1, Spring MVC, Bean Validation, JUnit 5, Mockito y MockMvc (`@WebMvcTest` + `@MockitoBean`).

## Estructura de esta fase

```
src/main/java/com/example/taller_persisntencia2
├── controller
│   ├── VenueController
│   ├── EventController
│   ├── ArtistController
│   ├── UserController
│   └── TicketController
├── dto
│   ├── request   (CreateEventRequest, RegisterUserRequest, PurchaseTicketRequest con Bean Validation)
│   └── response  (incluye ErrorResponse)
└── exception
    ├── ResourceNotFoundException
    ├── DuplicateResourceException
    ├── BusinessRuleException
    └── GlobalExceptionHandler   (@RestControllerAdvice)

src/test/java/com/example/taller_persisntencia2
├── controller   (un test por controller)
└── exception    (GlobalExceptionHandlerTest)
```

## Endpoints

Los 20 métodos públicos de los Services tienen un endpoint.

### Venues

| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| GET | `/api/venues/{code}` | 200 | 404 |
| GET | `/api/venues/active` | 200 | — |

### Eventos

| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| POST | `/api/events` | 201 | 400, 404, 409 |
| GET | `/api/events/{eventCode}` | 200 | 404 |
| GET | `/api/events/published` | 200 | — |
| PATCH | `/api/events/{eventCode}/publish` | 200 | 404, 409 |
| POST | `/api/events/{eventCode}/artists/{artistId}` | 200 | 400, 404, 409 |
| GET | `/api/events/by-artist?stageName=...` | 200 | 400 |

### Artistas

| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| GET | `/api/artists/{id}` | 200 | 400, 404 |
| GET | `/api/artists/by-stage-name?stageName=...` | 200 | 400, 404 |
| GET | `/api/artists/active` | 200 | — |

### Usuarios

| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| POST | `/api/users` | 201 | 400, 409 |
| GET | `/api/users/by-email?email=...` | 200 | 400, 404 |
| GET | `/api/users/by-username?username=...` | 200 | 400, 404 |

### Tickets

| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| POST | `/api/tickets` | 201 | 400, 404, 409 |
| GET | `/api/tickets/{ticketCode}` | 200 | 404 |
| GET | `/api/tickets/by-user?email=...` | 200 | 400 |
| GET | `/api/events/{eventCode}/tickets/paid` | 200 | 404 |
| PATCH | `/api/tickets/{ticketCode}/cancel` | 200 | 404, 409 |
| PATCH | `/api/tickets/{ticketCode}/use` | 200 | 404, 409 |

**Nota de diseño:** `GET /api/events/{eventCode}/tickets/paid` está implementado en `TicketController` (con `@RequestMapping("/api")`), no en `EventController`. La URL es la que define el contrato, pero así `EventController` no depende de `TicketService` y cada controller solo conoce el Service que necesita.

## Códigos HTTP

| Código | Uso |
|---|---|
| 200 | Consultas y actualizaciones correctas |
| 201 | Creación de evento, usuario o ticket |
| 400 | Request inválido o mal formado (Bean Validation, JSON inválido, parámetro faltante, tipo de ruta inválido) |
| 404 | Recurso inexistente (`ResourceNotFoundException`) |
| 409 | Duplicado (`DuplicateResourceException`) o regla de negocio incumplida (`BusinessRuleException`) |
| 500 | Error inesperado; el cliente recibe un mensaje genérico y el detalle solo se registra en el log |

## Formato de errores

Todos los errores usan `ErrorResponse`:

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

El manejo está centralizado en `GlobalExceptionHandler`. Además de las excepciones de dominio, convierte en 400 los parámetros obligatorios ausentes y los valores de ruta con tipo inválido (por ejemplo `/api/artists/abc`).

## Ejecutar las pruebas

Los comandos usan el Maven Wrapper. En Windows se usa `.\mvnw.cmd`; en Linux o Mac, `./mvnw`.

Suite completa (89 tests). Requiere Docker encendido, porque los tests de Persistencia usan Testcontainers:

```
.\mvnw.cmd clean test
```

Solo los tests de esta fase (no necesitan Docker, usan `@WebMvcTest` y Services mockeados):

```
.\mvnw.cmd test "-Dtest=GlobalExceptionHandlerTest,VenueControllerTest,ArtistControllerTest,UserControllerTest,EventControllerTest,TicketControllerTest"
```

Una clase individual:

```
.\mvnw.cmd test -Dtest=TicketControllerTest
```

| Clase | Tests |
|---|---|
| GlobalExceptionHandlerTest | 8 |
| VenueControllerTest | 3 |
| ArtistControllerTest | 7 |
| UserControllerTest | 10 |
| EventControllerTest | 17 |
| TicketControllerTest | 18 |

## Validación de entrada

Bean Validation cubre solo lo estructural (campos obligatorios, formato de email, valor mínimo, longitud máxima de `description`: 1000). Las reglas de negocio (usuario activo, evento publicado, edad mínima, capacidad, transiciones de estado, duplicados) permanecen en la capa Service.

## Fuera de alcance

Autenticación y autorización, paginación, versionado de la API (`/api/v1`), OpenAPI, pruebas E2E.

## Notas conocidas

- Los mensajes de error de los Services están en español (por ejemplo `"Usuario no encontrado"`), mientras que los de validación de los DTOs están en inglés. La API responde en ambos idiomas hasta que se unifiquen.
- El límite de 1000 caracteres de `description` es una decisión de API: la columna es `TEXT` y no impone límite en la base de datos.
