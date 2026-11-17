# PulsePass Web (Fase 5 — Frontend)

SPA en **React 19 + TypeScript (strict) + Tailwind CSS v4** que consume la API REST segura de PulsePass (20 operaciones de negocio + 3 de autenticación). El frontend presenta y orquesta; las reglas de negocio, los permisos y la propiedad de los recursos los decide el backend.

**Stack:** Vite · React Router v8 (`createBrowserRouter` + `RouterProvider` de `react-router/dom`) · TanStack Query · React Hook Form + zod · Vitest + Testing Library + MSW · oxlint.

## Requisitos

- Node **22.22+**
- La API de PulsePass (Fases 3 y 4) corriendo en `http://localhost:8080`

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # opcional; en Windows: copy .env.example .env.local
npm run dev                  # http://localhost:5173
```

En desarrollo, Vite redirige `/api` a `http://localhost:8080` (ver `vite.config.ts`), por eso no hace falta configurar CORS.

## Variables de entorno

| Variable            | Por defecto | Descripción                                                                 |
| ------------------- | ----------- | --------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`      | URL base de la API. Si apunta a otro origen, el backend debe permitir CORS. |

## Comandos

| Comando           | Qué hace                                  |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desarrollo (Vite)             |
| `npm run build`   | `tsc -b` (TypeScript estricto) + build    |
| `npm run preview` | Sirve el build de producción localmente   |
| `npm run lint`    | Análisis estático con oxlint              |
| `npm test`        | Vitest, una sola pasada (Testing Library + MSW, sin red real) |

Antes de entregar, deben terminar sin errores: `npm run lint`, `npm run build` y `npm test`.

## Roles y usuarios de demostración

Los usuarios vienen de la semilla local de la Fase 4. **Las contraseñas no se guardan en este repositorio**: consúltalas en la semilla del backend.

| Persona        | Perfil                    | Rol en la UI                                                         |
| -------------- | ------------------------- | -------------------------------------------------------------------- |
| Andrea         | Adulta, activa            | `USER`                                                               |
| Carlos         | Adulto, activo            | `USER`                                                               |
| Laura          | 17 años, activa           | `USER` (la compra se rechaza por edad) o `STAFF` en la demo de operación |
| Miguel         | Adulto, inactivo          | `USER` sin acceso (el login se rechaza)                              |
| Administración | —                         | `ADMIN` (semilla local controlada)                                   |

Datos de referencia: evento `CMF-2026` (Caribbean Music Fest 2026, `DRAFT` → `PUBLISHED`, edad mínima 18), sede `VEN-SMR-01` (Marina Convention Center, Santa Marta), artistas Solar Beat · Neon Waves · Caribbean Sound.

## Rutas principales

| Ruta                                  | Página                  | Acceso            |
| ------------------------------------- | ----------------------- | ----------------- |
| `/`                                   | Inicio                  | Público           |
| `/eventos`, `/eventos/:eventCode`     | Cartelera, detalle y compra | Público (comprar requiere `USER`) |
| `/artistas`, `/artistas/:id`          | Artistas                | Público           |
| `/sedes`, `/sedes/:code`              | Sedes                   | Público           |
| `/login`, `/registro`                 | Acceso y registro       | Solo anónimo      |
| `/cuenta`                             | Mi cuenta               | Sesión iniciada   |
| `/mis-tickets`, `/mis-tickets/:ticketCode` | Mis tickets y detalle | `USER`          |
| `/compra/confirmacion/:ticketCode`    | Confirmación de compra  | `USER`            |
| `/staff/validacion`                   | Validación de ingreso   | `STAFF`, `ADMIN`  |
| `/staff/eventos/:eventCode/tickets`   | Tickets pagados por evento | `STAFF`, `ADMIN` |
| `/admin/eventos`                      | Administración de eventos | `ADMIN`         |
| `/admin/eventos/nuevo`                | Crear evento            | `ADMIN`           |
| `/admin/eventos/:eventCode`           | Gestionar evento (publicar, asociar artista) | `ADMIN` |
| `/403`, cualquier otra ruta           | Sin permisos / No encontrada | Público      |

Ocultar un enlace o botón es solo UX: el servidor siempre responde 401/403 si corresponde y la UI lo respeta.

## Sesión y seguridad

- JWT Bearer con vigencia de 15 min, sin refresh token. Al vencer, o ante un 401, la sesión se cierra, se limpia la caché y se redirige a `/login` con aviso.
- El token vive solo en memoria y `sessionStorage` (nunca `localStorage`) y viaja únicamente en `Authorization`. Riesgo asumido: `sessionStorage` es legible ante XSS; se mitiga sin `dangerouslySetInnerHTML` con datos de la API.
- La compra usa el email de la sesión, no un campo editable.

## Estructura

```
src/
  componentes/       UI genérica (Boton, Campo, Modal, Tabla, Badge…)
  funcionalidades/   por dominio: api.ts, hooks.ts, tipos.ts (zod), componentes/
  layouts/           Layout, Navbar, guardas (RutaProtegida, RutaPorRol)
  lib/               cliente HTTP, ApiError, mensajes de error, claves de caché, rutas
  pages/             una página por ruta (carga perezosa salvo Inicio y Layout)
  test/              MSW (handlers, datos) y utilidades de render
```

## Limitaciones conocidas del backend (resueltas en el cliente)

- **GAP-01:** no existe un listado completo de eventos. El panel ADMIN busca por `eventCode` y recuerda en la sesión los borradores recién creados; se pierden al cerrar la pestaña.
- **GAP-03:** "Mis tickets" depende del email que expone `/api/auth/me`.
- **GAP-05:** sin CORS en el backend, solo funciona el proxy de desarrollo o el mismo origen.
- Sin paginación ni búsqueda en servidor: filtros de cartelera en el cliente.

## Diseños

Las imágenes de referencia visual (sección 9.0 del PRD) van en `docs/diseno/`. Si una imagen y un wireframe ASCII difieren, prevalece la imagen.