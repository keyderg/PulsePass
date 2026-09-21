Calixto Diaz 2023214059 ----- ----- ----- Keyder Granados 2023214035

# PulsePass — Plataforma de Eventos, Artistas y Entradas

Caso de estudio académico enfocado en el diseño de la capa de persistencia, modelado de dominio relacional, versionamiento de esquemas con Flyway y validación mediante pruebas de integración robustas.

## 🚀 Tecnologías y Stack Técnico
* **Lenguaje:** Java 21
* **Framework:** Spring Boot 4.x
* **Persistencia:** Spring Data JPA / Hibernate (`ddl-auto=validate`)
* **Base de Datos:** PostgreSQL
* **Control de Esquema:** Flyway
* **Testing:** JUnit 5, Testcontainers (PostgreSQL real, sin H2), AssertJ

---

## 🏛️ Modelo de Dominio
El sistema implementa las siguientes entidades principales y restricciones clave:
* **Venue 1 ── N Event:** Relación de sedes y sus eventos programados (Validación: `capacity > 0`, `code UNIQUE`).
* **Event N ── M Artist:** Relación de muchos a muchos gestionada mediante la tabla intermedia `event_artists` para evitar duplicados.
* **User 1 ── 1 UserProfile:** Asociación uno a uno protegida por restricción única en la clave foránea (`user_id`).
* **Ticket:** Entidad transaccional con datos propios (`ticketCode UNIQUE`, `price >= 0`, enums para `type` y `status`), relacionada con un usuario y un evento.

---

## 📂 Estructura de Clases del Proyecto

### Entidades de Dominio (`com.example.taller_persisntencia2.domain`)
* `Venue`: Representa la sede del evento (con validación de capacidad positiva).
* `Event`: Representa los eventos programados, enlazados a un venue y múltiples artistas.
* `Artist`: Artistas participantes en los eventos.
* `User`: Identidad de dominio de los usuarios.
* `UserProfile`: Perfil individual en relación 1:1 con el usuario.
* `Ticket`: Entidad transaccional de entrada con precio, tipo, estado y fecha de compra.
* *Enums:* `EventCategory`, `EventStatus`, `TicketType`, `TicketStatus`.

### Repositorios (`com.example.taller_persisntencia2.repository`)
* `VenueRepository`: Operaciones de persistencia para sedes.
* `EventRepository`: Consultas avanzadas (Query Methods y JPQL con `JOIN`, `COUNT` y `DISTINCT`).
* `ArtistRepository`: Gestión del catálogo de artistas.
* `UserRepository`: Gestión de usuarios y búsqueda por correo.
* `UserProfileRepository`: Gestión de perfiles de usuario.
* `TicketRepository`: Consultas de tickets por usuario, evento y estado.

---

## 📂 Migraciones de Base de Datos (Flyway)
El esquema evoluciona de manera controlada a través de scripts versionados ubicados en `src/main/resources/db/migration`:
1. **`V1__create_schema.sql`**: Creación inicial de tablas (`venues`, `events`, `artists`, `event_artists`, `users`, `user_profiles`, `tickets`), llaves primarias, foráneas, índices y restricciones `CHECK`/`UNIQUE`.
2. **`V2__insert_initial_artists.sql`**: Inserción del catálogo inicial de artistas de prueba (*Solar Beat*, *Neon Waves*, *Caribbean Sound*, etc.).
3. **`V3__add_streaming_url_to_event.sql`**: Extensión incremental para soportar eventos híbridos mediante la columna `streaming_url`.

---

## 🧪 Ejecución de Pruebas de Integración
Las pruebas garantizan la integridad de los repositorios, consultas JPQL y restricciones de la base de datos levantando un contenedor real de PostgreSQL mediante **Testcontainers**.

Para ejecutar toda la suite de pruebas y verificar que el proyecto finalice con éxito (`BUILD SUCCESS`), usa el siguiente comando en la raíz del proyecto:

Suite de Pruebas Implementada:
FlywayMigrationIT: Verifica la correcta aplicación de las migraciones V1, V2 y V3 desde una base limpia.

VenuePersistenceTest: Valida la persistencia y restricciones de negocio de las sedes.

TicketRepositoryIT: Comprueba la emisión de tickets, relaciones y consultas de conteo.

EventRepositoryIT: Valida el registro de eventos y consultas ordenadas por fecha.

UserProfileIT: Verifica la integridad de la relación 1:1 entre usuario y perfil.

EventArtistIT: Valida la correcta asociación N:M entre eventos y artistas sin duplicados.


## Preguntas para el equipo

1.  ¿Por que Ticket debe ser una entidad en lugar de un @ManyToMany entre User y Event?
R// Porque Ticket contiene atributos propios y transaccionales del negocio que no pueden representarse 
en una simple tabla intermedia.

2.  ¿Que reglas pertenecen a PostgreSQL y cuales deberian quedar para una futura capa Service?
R// Las restricciones estructurales duras (como unicidad UNIQUE, llaves foráneas) pertenecen estrictamente
a PostgreSQL para garantizar integridad a nivel de base de datos. La lógica de negocio transcurre 
luego en la capa de servicios o dominio.

3.  ¿Que consultas pueden expresarse claramente como Query Methods y cuales justifican JPQL?
R// Las consultas simples que siguen convenciones de nombres de atributos se resuelven mediante 
Query Methods. Las consultas que involucran múltiples JOINs complejos, cruces entre varias entidades 
(como ciudad y artista) o filtros avanzados con DISTINCT y case-insensitive justifican el 
uso de @Query con JPQL legible.

4.  ¿Que consecuencias tendria modificar V1 despues de haberla aplicado en un ambiente compartido?
R// Rompería el control de versiones de Flyway.

5.  ¿Que diferencias podria ocultar una prueba con H2 frente a PostgreSQL?
R// puede ocultar diferencias críticas en dialectos SQL, restricciones de concurrencia, comportamientos 
de tipos de datos avanzados y el rendimiento real de las consultas. Testcontainers con PostgreSQL
real elimina este riesgo.

6.  ¿Como evolucionaria el modelo para soportar inventario de tickets y evitar sobreventa?
R// Se agregaría una entidad TicketInventory o Section asociada al evento para manejar cupos por sector.

```powershell
# 
.\mvnw.cmd test


