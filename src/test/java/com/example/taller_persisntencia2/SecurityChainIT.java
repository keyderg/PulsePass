package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import com.example.taller_persisntencia2.security.JwtProperties;
import com.example.taller_persisntencia2.security.JwtService;
import com.example.taller_persisntencia2.service.AuthService;
import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Filtros de seguridad ACTIVOS (sin addFilters = false), JWT y base de datos reales. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
@Transactional
class SecurityChainIT {

    private static final String PASSWORD = "ClaveDePrueba2026!"; // ficticia
    private static final String FORBIDDEN_MESSAGE = "No tiene permisos para realizar esta operación";

    @Autowired private MockMvc mockMvc;
    @Autowired private AuthService authService;
    @Autowired private JwtService jwtService;
    @Autowired private JwtProperties jwtProperties;
    @Autowired private UserRepository userRepository;
    @Autowired private UserRoleRepository roleRepository;
    @Autowired private EntityManager em;

    private UserResponse register(String username) {
        return authService.register(new RegisterUserRequest(username, username + "@test.com",
                "Andrea", "Perez", "3001234567", "Santa Marta", LocalDate.of(2000, 5, 10), PASSWORD));
    }

    private String tokenFor(String username, Role extraRole) {
        UserResponse user = register(username);
        if (extraRole != null) {
            roleRepository.save(new UserRole(user.id(), extraRole));
        }
        return jwtService.generateToken(user.id());
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private static ResultMatcher notDenied() {
        return result -> assertThat(result.getResponse().getStatus()).isNotIn(401, 403);
    }

    @Test
    void anonymousCanReadPublicRoutes() throws Exception {
        mockMvc.perform(get("/api/events/published")).andExpect(status().isOk());
        mockMvc.perform(get("/api/venues/active")).andExpect(status().isOk());
        mockMvc.perform(get("/api/artists/active")).andExpect(status().isOk());
    }

    @Test
    void anonymousOnProtectedRouteGets401WithErrorResponse() throws Exception {
        mockMvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Autenticación requerida"))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void userRoleOnAdminRouteGets403WithErrorResponse() throws Exception {
        String token = tokenFor("sec_user", null);

        mockMvc.perform(post("/api/events")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value(FORBIDDEN_MESSAGE))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void adminPassesTheRoleCheckOnAdminRoute() throws Exception {
        String token = tokenFor("sec_admin", Role.ADMIN);

        mockMvc.perform(post("/api/events")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(notDenied()); // llega al controlador (el 400 de validación es otro tema)
    }

    @Test
    void staffCanUseTicketsEndpointButUserCannot() throws Exception {
        String staff = tokenFor("sec_staff", Role.STAFF);
        String user = tokenFor("sec_plain", null);

        mockMvc.perform(patch("/api/tickets/NO-EXISTE/use").header(HttpHeaders.AUTHORIZATION, bearer(staff)))
                .andExpect(notDenied());
        mockMvc.perform(patch("/api/tickets/NO-EXISTE/use").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                .andExpect(status().isForbidden());
    }

    @Test
    void validTokenReachesMeAndNoSessionCookieIsCreated() throws Exception {
        UserResponse user = register("sec_me");
        String token = jwtService.generateToken(user.id());

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.id()))
                .andExpect(jsonPath("$.username").value("sec_me"))
                .andExpect(jsonPath("$.roles[0]").value("USER"))
                .andExpect(header().doesNotExist("Set-Cookie"));
    }

    @Test
    void expiredTokenGets401() throws Exception {
        UserResponse user = register("sec_expired");
        JwtService inThePast = new JwtService(jwtProperties,
                Clock.fixed(Instant.now().minus(Duration.ofHours(1)), ZoneOffset.UTC));

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer(inThePast.generateToken(user.id()))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void tamperedTokenGets401() throws Exception {
        UserResponse user = register("sec_tampered");
        String[] parts = jwtService.generateToken(user.id()).split("\\.");
        char first = parts[2].charAt(0);
        String tampered = parts[0] + "." + parts[1] + "." + (first == 'A' ? 'B' : 'A') + parts[2].substring(1);

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(tampered)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void malformedBearerGets401NotServerError() throws Exception {
        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer "))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void nonBearerSchemeIsIgnored() throws Exception {
        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void twoAuthorizationHeadersDoNotAuthenticate() throws Exception {
        UserResponse user = register("sec_double");
        String token = bearer(jwtService.generateToken(user.id()));

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInQueryStringIsIgnored() throws Exception {
        UserResponse user = register("sec_query");

        mockMvc.perform(get("/api/auth/me").param("access_token", jwtService.generateToken(user.id())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidBearerOnPublicRouteStaysPublic() throws Exception {
        mockMvc.perform(get("/api/events/published").header(HttpHeaders.AUTHORIZATION, "Bearer basura"))
                .andExpect(status().isOk());
    }

    @Test
    void tokenOfInactiveUserGets401() throws Exception {
        UserResponse registered = register("sec_inactive");
        String token = jwtService.generateToken(registered.id());
        User user = userRepository.findById(registered.id()).orElseThrow();
        user.setActive(false);
        userRepository.saveAndFlush(user);
        em.clear();

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenOfDeletedUserGets401() throws Exception {
        UserResponse registered = register("sec_deleted");
        String token = jwtService.generateToken(registered.id());
        em.flush();
        em.clear();
        userRepository.deleteById(registered.id());
        em.flush();
        em.clear();

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void fullFlowRegisterLoginAndMe() throws Exception {
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content("""
                        {
                          "username": "flow_user",
                          "email": "flow_user@test.com",
                          "firstName": "Andrea",
                          "lastName": "Perez",
                          "phone": "3001234567",
                          "city": "Santa Marta",
                          "birthDate": "2000-05-10",
                          "password": "ClaveDePrueba2026!"
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("flow_user"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"flow_user\",\"password\":\"ClaveDePrueba2026!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andReturn();
        String token = JsonPath.read(login.getResponse().getContentAsString(), "$.accessToken");

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("flow_user"));
    }

    @Test
    void loginWithWrongPasswordGetsGeneric401() throws Exception {
        register("sec_wrongpass");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"sec_wrongpass\",\"password\":\"OtraClaveDistinta1!\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Credenciales inválidas"));
    }
}