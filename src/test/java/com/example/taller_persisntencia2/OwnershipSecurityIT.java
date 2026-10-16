package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.Event;
import com.example.taller_persisntencia2.domain.EventCategory;
import com.example.taller_persisntencia2.domain.EventStatus;
import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.Ticket;
import com.example.taller_persisntencia2.domain.TicketStatus;
import com.example.taller_persisntencia2.domain.TicketType;
import com.example.taller_persisntencia2.domain.Venue;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.repository.EventRepository;
import com.example.taller_persisntencia2.repository.TicketRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import com.example.taller_persisntencia2.repository.VenueRepository;
import com.example.taller_persisntencia2.security.JwtService;
import com.example.taller_persisntencia2.service.AuthService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Matriz de propiedad y visibilidad con la cadena de seguridad real (sin addFilters = false). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
@Transactional
class OwnershipSecurityIT {

    private static final String PASSWORD = "ClaveDePrueba2026!"; // ficticia
    private static final String FORBIDDEN = "No tiene permisos para realizar esta operación";
    private static final String CARLOS_EMAIL = "carlos_s@test.com";
    private static final String ANDREA_EMAIL = "andrea_s@test.com";

    @Autowired private MockMvc mockMvc;
    @Autowired private AuthService authService;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private UserRoleRepository roleRepository;
    @Autowired private VenueRepository venueRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private EntityManager em;

    private String andreaToken;
    private String carlosToken;
    private String staffToken;
    private String adminToken;
    private String carlosTicket;
    private String andreaTicket;

    @BeforeEach
    void setUp() {
        UserResponse andrea = register("andrea_s");
        UserResponse carlos = register("carlos_s");
        UserResponse staff = register("laura_s");
        UserResponse admin = register("admin_s");
        roleRepository.save(new UserRole(staff.id(), Role.STAFF));
        roleRepository.save(new UserRole(admin.id(), Role.ADMIN));

        andreaToken = jwtService.generateToken(andrea.id());
        carlosToken = jwtService.generateToken(carlos.id());
        staffToken = jwtService.generateToken(staff.id());
        adminToken = jwtService.generateToken(admin.id());

        Venue venue = venueRepository.save(new Venue("VEN-SEC", "Arena", "Santa Marta", "Calle 1", 1000));
        Event published = eventRepository.save(new Event("EV-PUB", "Festival", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.now().plusDays(30), venue));
        eventRepository.save(new Event("EV-DRAFT", "Borrador", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.now().plusDays(30), venue));

        carlosTicket = createTicket("TKT-CARLOS", carlos.id(), published);
        andreaTicket = createTicket("TKT-ANDREA", andrea.id(), published);
        em.flush();
        em.clear();
    }

    private UserResponse register(String username) {
        return authService.register(new RegisterUserRequest(username, username + "@test.com",
                "Persona", "Prueba", "3001234567", "Santa Marta", LocalDate.of(2000, 5, 10), PASSWORD));
    }

    private String createTicket(String code, Long ownerId, Event event) {
        ticketRepository.save(new Ticket(code, TicketType.values()[0], BigDecimal.valueOf(100),
                TicketStatus.PAID, LocalDateTime.now(), userRepository.findById(ownerId).orElseThrow(), event));
        return code;
    }

    private ResultActions call(MockHttpServletRequestBuilder request, String token) throws Exception {
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private ResultActions get(String url, String token) throws Exception {
        return call(MockMvcRequestBuilders.get(url), token);
    }

    private ResultActions patch(String url, String token) throws Exception {
        return call(MockMvcRequestBuilders.patch(url), token);
    }

    private TicketStatus statusOf(String code) {
        em.flush();   // escribe en la base de datos lo que el servicio cambió dentro de esta transacción
        em.clear();   // y descarta la caché para releer desde la base de datos
        return ticketRepository.findByTicketCode(code).orElseThrow().getStatus();
    }

    // ---------- Tickets por código: ajeno = 404 ----------

    @Test
    void foreignTicketReadLooksLikeNonExistent() throws Exception {
        get("/api/tickets/" + carlosTicket, andreaToken)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket no encontrado"));
        get("/api/tickets/NO-EXISTE", andreaToken)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket no encontrado"));
    }

    @Test
    void ownerStaffAndAdminCanReadTicket() throws Exception {
        get("/api/tickets/" + carlosTicket, carlosToken)
                .andExpect(status().isOk()).andExpect(content().string(containsString(carlosTicket)));
        get("/api/tickets/" + carlosTicket, staffToken).andExpect(status().isOk());
        get("/api/tickets/" + carlosTicket, adminToken).andExpect(status().isOk());
    }

    @Test
    void anonymousCannotReadTicket() throws Exception {
        get("/api/tickets/" + carlosTicket, null).andExpect(status().isUnauthorized());
    }

    @Test
    void foreignCancelIsHiddenAndDoesNotChangeTheTicket() throws Exception {
        patch("/api/tickets/" + carlosTicket + "/cancel", andreaToken)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket no encontrado"));

        assertThat(statusOf(carlosTicket)).isEqualTo(TicketStatus.PAID);
    }

    @Test
    void ownerCanCancelOwnTicket() throws Exception {
        patch("/api/tickets/" + carlosTicket + "/cancel", carlosToken).andExpect(status().isOk());

        assertThat(statusOf(carlosTicket)).isEqualTo(TicketStatus.CANCELLED);
    }

    @Test
    void staffCannotCancelOthersTicketButAdminCan() throws Exception {
        patch("/api/tickets/" + carlosTicket + "/cancel", staffToken).andExpect(status().isNotFound());
        assertThat(statusOf(carlosTicket)).isEqualTo(TicketStatus.PAID);

        patch("/api/tickets/" + carlosTicket + "/cancel", adminToken).andExpect(status().isOk());
        assertThat(statusOf(carlosTicket)).isEqualTo(TicketStatus.CANCELLED);
    }

    @Test
    void ownerCannotMarkOwnTicketAsUsed() throws Exception {
        patch("/api/tickets/" + carlosTicket + "/use", carlosToken)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(FORBIDDEN));

        assertThat(statusOf(carlosTicket)).isEqualTo(TicketStatus.PAID);
    }

    // ---------- Búsquedas por correo / username: otro = 403 ----------

    @Test
    void ticketsByUserAreSelfOrAdminOnly() throws Exception {
        get("/api/tickets/by-user?email=" + ANDREA_EMAIL, andreaToken).andExpect(status().isOk());
        get("/api/tickets/by-user?email=ANDREA_S@TEST.COM", andreaToken).andExpect(status().isOk());
        get("/api/tickets/by-user?email=" + CARLOS_EMAIL, andreaToken)
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value(FORBIDDEN));
        // Un correo que no existe responde igual: no se filtra quién está registrado.
        get("/api/tickets/by-user?email=fantasma@test.com", andreaToken)
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value(FORBIDDEN));
        get("/api/tickets/by-user?email=" + CARLOS_EMAIL, staffToken).andExpect(status().isForbidden());
        get("/api/tickets/by-user?email=" + CARLOS_EMAIL, adminToken).andExpect(status().isOk());
    }

    @Test
    void userLookupsAreSelfOrAdminOnly() throws Exception {
        get("/api/users/by-email?email=" + ANDREA_EMAIL, andreaToken).andExpect(status().isOk());
        get("/api/users/by-email?email=" + CARLOS_EMAIL, andreaToken).andExpect(status().isForbidden());
        get("/api/users/by-username?username=andrea_s", andreaToken).andExpect(status().isOk());
        get("/api/users/by-username?username=carlos_s", andreaToken).andExpect(status().isForbidden());
        get("/api/users/by-email?email=" + CARLOS_EMAIL, adminToken).andExpect(status().isOk());
        get("/api/users/by-username?username=carlos_s", adminToken).andExpect(status().isOk());
    }

    // ---------- Compra ----------

    private String purchaseJson(String email) {
        return "{\"userEmail\":\"" + email + "\",\"eventCode\":\"EV-PUB\",\"type\":\""
                + TicketType.values()[0].name() + "\"}";
    }

    @Test
    void purchaseForAnotherEmailIsForbiddenAndCreatesNothing() throws Exception {
        int before = ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(CARLOS_EMAIL).size();

        call(MockMvcRequestBuilders.post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON).content(purchaseJson(CARLOS_EMAIL)), andreaToken)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(FORBIDDEN));

        em.flush();
        em.clear();
        assertThat(ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(CARLOS_EMAIL))
                .hasSize(before);
    }

    @Test
    void purchaseForOwnEmailIsAllowed() throws Exception {
        call(MockMvcRequestBuilders.post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON).content(purchaseJson(ANDREA_EMAIL)), andreaToken)
                .andExpect(status().isCreated());
    }

    @Test
    void anonymousPurchaseGets401() throws Exception {
        call(MockMvcRequestBuilders.post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON).content(purchaseJson(ANDREA_EMAIL)), null)
                .andExpect(status().isUnauthorized());
    }

    // ---------- Visibilidad de borradores ----------

    @Test
    void draftEventLooksNonExistentExceptForStaffAndAdmin() throws Exception {
        get("/api/events/EV-PUB", null).andExpect(status().isOk());

        get("/api/events/EV-DRAFT", null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Evento no encontrado"));
        get("/api/events/NO-EXISTE", null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Evento no encontrado"));
        get("/api/events/EV-DRAFT", andreaToken).andExpect(status().isNotFound());

        get("/api/events/EV-DRAFT", staffToken).andExpect(status().isOk());
        get("/api/events/EV-DRAFT", adminToken).andExpect(status().isOk());
    }

    @Test
    void eventsByArtistIsAPublicRoute() throws Exception {
        get("/api/events/by-artist?stageName=Nadie", null)
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}