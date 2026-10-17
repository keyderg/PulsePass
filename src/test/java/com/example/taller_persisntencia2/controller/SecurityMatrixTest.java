package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.service.ArtistService;
import com.example.taller_persisntencia2.service.AuthService;
import com.example.taller_persisntencia2.service.EventService;
import com.example.taller_persisntencia2.service.TicketService;
import com.example.taller_persisntencia2.service.UserService;
import com.example.taller_persisntencia2.service.VenueService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Matriz de seguridad de las 20 operaciones originales: anónimo, USER, STAFF y ADMIN.
 * Comprueba las reglas por rol de la cadena real. La propiedad (dueño o tercero) depende de los
 * servicios y se prueba en OwnershipSecurityIT.
 */
@WebMvcTest
class SecurityMatrixTest extends SecuredControllerTest {

    private static final String FORBIDDEN_MESSAGE = "No tiene permisos para realizar esta operación";

    /** Quién puede llamar a la ruta, a nivel de URL. */
    enum Access { PUBLIC, AUTHENTICATED, STAFF_OR_ADMIN, ADMIN }

    record Operation(String id, HttpMethod method, String pattern, String url, Access access) {
        @Override
        public String toString() {
            return id + " " + method.name() + " " + url;
        }
    }

    static Stream<Operation> operations() {
        return Stream.of(
                // Venue
                new Operation("FR-SECVEN-01", HttpMethod.GET, "/api/venues/{}", "/api/venues/VEN-SMR-01", Access.PUBLIC),
                new Operation("FR-SECVEN-02", HttpMethod.GET, "/api/venues/active", "/api/venues/active", Access.PUBLIC),
                // Event
                new Operation("FR-SECEVT-01", HttpMethod.POST, "/api/events", "/api/events", Access.ADMIN),
                new Operation("FR-SECEVT-02", HttpMethod.GET, "/api/events/{}", "/api/events/CMF-2026", Access.PUBLIC),
                new Operation("FR-SECEVT-03", HttpMethod.GET, "/api/events/published", "/api/events/published", Access.PUBLIC),
                new Operation("FR-SECEVT-04", HttpMethod.PATCH, "/api/events/{}/publish", "/api/events/CMF-2026/publish", Access.ADMIN),
                new Operation("FR-SECEVT-05", HttpMethod.POST, "/api/events/{}/artists/{}", "/api/events/CMF-2026/artists/1", Access.ADMIN),
                new Operation("FR-SECEVT-06", HttpMethod.GET, "/api/events/by-artist", "/api/events/by-artist?stageName=Solar-Beat", Access.PUBLIC),
                // Artist
                new Operation("FR-SECART-01", HttpMethod.GET, "/api/artists/{}", "/api/artists/1", Access.PUBLIC),
                new Operation("FR-SECART-02", HttpMethod.GET, "/api/artists/by-stage-name", "/api/artists/by-stage-name?stageName=Solar-Beat", Access.PUBLIC),
                new Operation("FR-SECART-03", HttpMethod.GET, "/api/artists/active", "/api/artists/active", Access.PUBLIC),
                // User (la propiedad se comprueba en el servicio)
                new Operation("FR-SECUSR-01", HttpMethod.POST, "/api/users", "/api/users", Access.PUBLIC),
                new Operation("FR-SECUSR-02", HttpMethod.GET, "/api/users/by-email", "/api/users/by-email?email=andrea@test.com", Access.AUTHENTICATED),
                new Operation("FR-SECUSR-03", HttpMethod.GET, "/api/users/by-username", "/api/users/by-username?username=andrea", Access.AUTHENTICATED),
                // Ticket (la propiedad se comprueba en el servicio)
                new Operation("FR-SECTKT-01", HttpMethod.POST, "/api/tickets", "/api/tickets", Access.AUTHENTICATED),
                new Operation("FR-SECTKT-02", HttpMethod.GET, "/api/tickets/{}", "/api/tickets/TKT-0001", Access.AUTHENTICATED),
                new Operation("FR-SECTKT-03", HttpMethod.GET, "/api/tickets/by-user", "/api/tickets/by-user?email=andrea@test.com", Access.AUTHENTICATED),
                new Operation("FR-SECTKT-04", HttpMethod.GET, "/api/events/{}/tickets/paid", "/api/events/CMF-2026/tickets/paid", Access.STAFF_OR_ADMIN),
                new Operation("FR-SECTKT-05", HttpMethod.PATCH, "/api/tickets/{}/cancel", "/api/tickets/TKT-0001/cancel", Access.AUTHENTICATED),
                new Operation("FR-SECTKT-06", HttpMethod.PATCH, "/api/tickets/{}/use", "/api/tickets/TKT-0001/use", Access.STAFF_OR_ADMIN)
        );
    }

    @Autowired private MockMvc mockMvc;

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping handlerMapping;

    @MockitoBean private VenueService venueService;
    @MockitoBean private EventService eventService;
    @MockitoBean private ArtistService artistService;
    @MockitoBean private UserService userService;
    @MockitoBean private TicketService ticketService;
    @MockitoBean private AuthService authService;

    private MockHttpServletRequestBuilder request(Operation op) {
        MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.request(op.method(), op.url());
        if (!HttpMethod.GET.equals(op.method())) {
            builder.contentType(MediaType.APPLICATION_JSON).content("{}");
        }
        return builder;
    }

    /** "Pasó la barrera de seguridad": lo que responda después (200, 400...) ya es asunto del controlador. */
    private static ResultMatcher notDenied() {
        return result -> assertThat(result.getResponse().getStatus()).isNotIn(401, 403);
    }

    private void verifyNoServiceWasCalled() {
        org.mockito.Mockito.verifyNoInteractions(
                venueService, eventService, artistService, userService, ticketService, authService);
    }

    private void expectForbidden(ResultActions result) throws Exception {
        result.andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value(FORBIDDEN_MESSAGE));
        verifyNoServiceWasCalled();
    }

    @ParameterizedTest(name = "[anónimo] {0}")
    @MethodSource("operations")
    void anonymous(Operation op) throws Exception {
        ResultActions result = mockMvc.perform(request(op));

        if (op.access() == Access.PUBLIC) {
            result.andExpect(notDenied());
        } else {
            result.andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.message").value("Autenticación requerida"));
            verifyNoServiceWasCalled();
        }
    }

    @ParameterizedTest(name = "[USER] {0}")
    @MethodSource("operations")
    void userRole(Operation op) throws Exception {
        ResultActions result = mockMvc.perform(request(op).with(asUser()));

        if (op.access() == Access.STAFF_OR_ADMIN || op.access() == Access.ADMIN) {
            expectForbidden(result);
        } else {
            result.andExpect(notDenied());
        }
    }

    @ParameterizedTest(name = "[STAFF] {0}")
    @MethodSource("operations")
    void staffRole(Operation op) throws Exception {
        ResultActions result = mockMvc.perform(request(op).with(asStaff()));

        if (op.access() == Access.ADMIN) {
            expectForbidden(result);
        } else {
            result.andExpect(notDenied());
        }
    }

    @ParameterizedTest(name = "[ADMIN] {0}")
    @MethodSource("operations")
    void adminRole(Operation op) throws Exception {
        mockMvc.perform(request(op).with(asAdmin())).andExpect(notDenied());
    }

    /**
     * Si alguien agrega un endpoint a la API y no lo agrega a la matriz, este test falla.
     * /api/auth/login y /api/auth/me son nuevos de la Fase 4 y tienen sus propias pruebas.
     */
    @Test
    void theMatrixCoversExactlyTheTwentyOriginalRoutes() {
        Set<String> inApplication = handlerMapping.getHandlerMethods().keySet().stream()
                .flatMap(SecurityMatrixTest::routesOf)
                .filter(route -> route.contains(" /api/"))
                .filter(route -> !route.contains(" /api/auth/"))
                .collect(Collectors.toCollection(TreeSet::new));

        Set<String> inMatrix = operations()
                .map(op -> op.method().name() + " " + op.pattern())
                .collect(Collectors.toCollection(TreeSet::new));

        assertThat(inMatrix).hasSize(20);
        assertThat(inApplication).containsExactlyInAnyOrderElementsOf(inMatrix);
    }

    private static Stream<String> routesOf(RequestMappingInfo info) {
        Set<String> patterns = info.getPathPatternsCondition() == null
                ? Set.of()
                : info.getPathPatternsCondition().getPatternValues();
        return info.getMethodsCondition().getMethods().stream()
                .flatMap(method -> patterns.stream()
                        .map(pattern -> method.name() + " " + pattern.replaceAll("\\{[^}]+\\}", "{}")));
    }
}