# Reporte de calidad — Etapa 11 (PulsePass Frontend)

Estado de la revisión de la Definition of Done (PRD 30.2) y de la cobertura API → UI (PRD 10.3).
Leyenda: ✅ cumple (verificado en el código) · ⚠️ cumple parcialmente o hay que decidir · ⏳ pendiente de verificar.

> Alcance de esta revisión: auditoría estática del código (búsquedas sobre `src/`). `npm run lint`, `npm run build` y `npm test` no se pudieron ejecutar aquí porque `node_modules` trae binarios de Windows; deben correrse en tu máquina.

## 1. Definition of Done (30.2)

| # | Criterio | Estado | Evidencia / nota |
|---|----------|:------:|------------------|
| 1 | 20 rutas/páginas con carga perezosa (excepto Inicio y Layout) | ✅ | `Router.tsx`: 19 páginas con `lazy` + `Inicio` y `Layout` eager. `ErrorPagina` también es eager (es el `errorElement`). |
| 2 | `createBrowserRouter` + `RouterProvider` de `react-router/dom`; sin `react-router-dom` | ✅ | `main.tsx`; 0 coincidencias de `react-router-dom` en `src/` y `package.json`. |
| 3 | 20 operaciones F3 + 3 de F4 alcanzables desde la UI | ⚠️ | Ver sección 2: la operación 10 no se invoca desde ninguna pantalla; la 14 solo de forma indirecta. |
| 4 | Tipos derivados de zod y respuestas validadas | ✅ | `z.infer` en los 6 `tipos.ts`; `http.ts` valida con `safeParse`. Revisar que `UsuarioAutenticado` y `EventoTarjeta` (únicas `interface` a mano) deriven de esquemas. |
| 5 | Todos los formularios con React Hook Form + zod | ⚠️ | Login, Registro, Crear evento y Validación de ingreso sí. `AdminEventos` (buscar por código) y `TicketsPagadosEvento` (selector de evento) usan `useState`. |
| 6 | JWT solo en memoria/`sessionStorage` y solo en `Authorization` | ✅ | `almacen.ts` y `http.ts:66`. |
| 7 | `RutaProtegida` y `RutaPorRol` funcionan; se respeta 401/403 | ✅ | `Router.tsx` + tests de guardas (TEST-FE-AUTH-008). |
| 8 | 401 cierra sesión, limpia caché y redirige a login | ✅ | `http.ts:83` (`alSesionExpirada`) y TEST-FE-AUTH-010. |
| 9 | 400, 401, 403, 404, 409 y 500 según la sección 13 | ✅ | Cubierto por `mensajesError.test.ts` y `http.test.ts` (verde en tus corridas). |
| 10 | La compra usa el email de la sesión, nunca un campo editable | ✅ | `ModalCompra.tsx:24`; se muestra como dato de solo lectura. |
| 11 | Sin reglas de negocio en componentes | ✅ | `minimumAge` y `capacity` solo se muestran, nunca se comparan. |
| 12 | Estados de carga, vacío y error en cada pantalla de datos | ⏳ | No revisé página por página (QT-FE-001). |
| 13 | Sin clases Tailwind construidas dinámicamente | ✅ | Solo `HeroInicio.tsx` usa plantilla, con una constante `base` estática; no interpola tokens. |
| 14 | Cada página coincide con su imagen de la sección 9.0 | ⏳ | Pendiente: comparar con las 34 imágenes de `diseno.zip`. |
| 15 | Variantes móvil (390 px) y modo oscuro implementadas | ⏳ | Pendiente de revisión visual. |
| 16 | Responsive desde 360 px y navegación por teclado completa | ⏳ | Pendiente de revisión visual y con teclado. |
| 17 | Sin `any`, `React.FC`, `localStorage` para el token ni `dangerouslySetInnerHTML` | ✅ | 0 coincidencias fuera de tests; `localStorage` solo aparece en un test que comprueba que está vacío. |
| 18 | Pruebas de la sección 21 pasan | ⚠️ | Última corrida que vi: 133/135. Fallaban 2 tests de navbar en `staff.test.tsx` (ver nota abajo). |
| 19 | `npm run lint`, `build` y `test` sin errores | ⏳ | No ejecutable aquí; correr en local. |
| 20 | Sin secretos y existe `.env.example` | ✅ | `.env.example` creado; no hay archivos `.env` en el proyecto; `.gitignore` ahora excluye `.env` y `.env.*`. |
| 21 | README con variables, comandos, roles y rutas | ✅ | `README.md` reescrito (el anterior mencionaba ESLint y no documentaba nada de lo pedido). |

**Nota sobre los 2 tests fallidos:** el enlace "Tickets pagados" está bien implementado (`enlaces.ts` lo muestra a STAFF y ADMIN, como pide la tabla 8.4). El fallo es del test: consultaba de inmediato, antes de que la sesión cargara. En ADMIN debe esperar el enlace con `await within(nav).findByRole(...)`; en USER debe esperar primero a "Mis tickets" y después comprobar con `queryByRole` que "Tickets pagados" no está.

## 2. Cobertura API → Frontend (tabla 10.3)

| # | Operación | Hook | Se invoca desde | Estado |
|---|-----------|------|-----------------|:------:|
| 1 | GET /api/venues/{code} | `useSede` | DetalleSede, DetalleEvento | ✅ |
| 2 | GET /api/venues/active | `useSedesActivas` | ListaSedes, FormularioCrearEvento | ✅ |
| 3 | POST /api/events | `useCrearEvento` | FormularioCrearEvento | ✅ |
| 4 | GET /api/events/{eventCode} | `useEvento` | DetalleEvento, AdminGestionEvento, FilaEventoCreado | ✅ |
| 5 | GET /api/events/published | `useEventosPublicados` | Inicio, CatalogoEventos | ✅ |
| 6 | PATCH /api/events/{eventCode}/publish | `usePublicarEvento` | ModalPublicarEvento | ✅ |
| 7 | POST /api/events/{eventCode}/artists/{artistId} | `useAsociarArtista` | AsociarArtista | ✅ |
| 8 | GET /api/events/by-artist | `useEventosPorArtista` | CatalogoEventos, DetalleArtista | ✅ |
| 9 | GET /api/artists/{id} | `useArtista` | DetalleArtista | ✅ |
| 10 | GET /api/artists/by-stage-name | `useArtistaPorNombre` | **Ninguna** | ⚠️ |
| 11 | GET /api/artists/active | `useArtistasActivos` | Inicio, ListaArtistas, CatalogoEventos, AsociarArtista | ✅ |
| 12 | POST /api/users | `useRegistrarUsuario` | FormularioRegistro | ✅ |
| 13 | GET /api/users/by-email | `useUsuarioPorEmail` | Cuenta | ✅ |
| 14 | GET /api/users/by-username | `useUsuarioPorUsername` (sin uso) | AuthContext (`obtenerUsuarioPorUsername`, al cargar la sesión) | ⚠️ indirecta |
| 15 | POST /api/tickets | `useComprarTicket` | ModalCompra | ✅ |
| 16 | GET /api/tickets/{ticketCode} | `useTicket` | DetalleTicket, ConfirmacionCompra | ✅ |
| 17 | GET /api/tickets/by-user | `useMisTickets` | MisTickets | ✅ |
| 18 | GET /api/events/{eventCode}/tickets/paid | `useTicketsPagadosPorEvento` | TicketsPagadosEvento | ✅ |
| 19 | PATCH /api/tickets/{ticketCode}/cancel | `useCancelarTicket` | ModalConfirmarCancelacion | ✅ |
| 20 | PATCH /api/tickets/{ticketCode}/use | `useUsarTicket` | ValidacionIngreso, TicketsPagadosEvento | ✅ |
| A1 | POST /api/auth/login | `iniciarSesion` (AuthContext) | Login | ✅ |
| A2 | GET /api/auth/me | consulta de sesión (AuthContext) | Layout, Cuenta | ✅ |
| A3 | POST /api/users (F4) | `useRegistrarUsuario` | Registro | ✅ |

El PRD dice: *"No se considera completa la Fase 5 si existe una operación de la tabla sin una forma de invocarla desde la UI."* Hay que cerrar la **10** y decidir sobre la **14**:

- **Op. 10:** la tabla la asigna a CatalogoEventos (filtro) y DetalleArtista. Opción mínima: en `DetalleArtista`, resolver el artista por `stageName` cuando la URL lo traiga, o en el filtro de cartelera usar `useArtistaPorNombre` para validar el artista elegido.
- **Op. 14:** hoy solo se llama al restaurar la sesión. Opción mínima: usar `useUsuarioPorUsername` en `Cuenta` o borrar el hook sin uso y documentar que la invoca `AuthContext`.

## 3. Pendiente

1. Cerrar la op. 10 y decidir la 14 (sección 2).
2. Decidir si los dos formularios de búsqueda por código pasan a RHF + zod (DoD #5).
3. Aplicar la corrección de los 2 tests de navbar y volver a ejecutar `npm test`.
4. Correr `npm run lint` y `npm run build` en local.
5. Auditoría de accesibilidad (Lighthouse o axe) en las páginas principales (QT-FE-011).
6. Revisión visual: móvil 390 px, responsive desde 360 px, modo oscuro y navegación por teclado.
7. Comparar cada página con su imagen de `diseno.zip` (DoD #14).
8. Confirmar que cada página tiene prueba de sus estados de carga, vacío y error (QT-FE-001).


## 4. Correcciones posteriores a la auditoría

Esta sección actualiza las secciones 1 a 3 donde difieran.

| Hallazgo | Acción |
|----------|--------|
| Op. 10 y 14 sin forma clara de invocarse | Ya se invocan: `CatalogoEventos` usa `useArtistaPorNombre` y `Cuenta` usa `useUsuarioPorUsername`. Cuentan como cubiertas. |
| DoD #5: formularios de búsqueda por código | Ya usan RHF + zod (`BuscadorEventoPorCodigo` con `BuscarEventoSchema`). Sin cambios. |
| Falta barra de compra fija en móvil (DES-07) | `PanelCompra` renderiza una barra `fixed inset-x-0 bottom-0 md:hidden` con "Comprar" / "Iniciar sesión"; `DetalleEvento` añade `pb-20 md:pb-0`. Test: `barraCompra.test.tsx`. |
| Falta alternar modo oscuro (FR-FE-GEN-004) | `lib/tema.ts` + `layouts/BotonTema.tsx` (en la Navbar, escritorio y móvil). La preferencia se guarda en `sessionStorage` y `index.html` la aplica antes de pintar. Test: `tema.test.tsx`. |
| 10 tests en `Interactivos.tsx` no se ejecutaban | Renombrado a `Interactivos.test.tsx`. |
| Archivo `env.example` sin punto | Renombrado a `.env.example`. |
| Restos de la etapa 2 | Eliminados `PantallaPrueba.tsx`, `PantallaPrueba.test.tsx` y `PaginaPendiente.tsx`. |
| `eventos/:eventCode?` con parámetro opcional | Ahora `eventos/:eventCode`. |
| `UsuarioAutenticado` y `EventoTarjeta` como `interface` | Ahora `z.object` + `z.infer` (`UsuarioAutenticadoSchema`, `EventoTarjetaSchema`). |

Pendiente de verificar en local: `npm run lint`, `npm run build` y `npm test` (los cambios solo se comprobaron a nivel de sintaxis TypeScript).
