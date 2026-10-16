package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.dto.request.LoginRequest;
import com.example.taller_persisntencia2.dto.response.AuthResponse;
import com.example.taller_persisntencia2.dto.response.AuthenticatedUserResponse;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import com.example.taller_persisntencia2.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    private static final String LOGIN_JSON = """
            {
              "identifier": "andrea",
              "password": "ClaveDePrueba2026!"
            }
            """;

    private LoginRequest loginRequest() {
        return new LoginRequest("andrea", "ClaveDePrueba2026!");
    }

    @Test
    void login_validCredentials_returns200WithBearerToken() throws Exception {
        when(authService.login(loginRequest())).thenReturn(new AuthResponse("token-de-prueba", "Bearer", 900));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").value("token-de-prueba"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900));
    }

    @Test
    void login_badCredentials_returns401GenericWithoutLeakingDetails() throws Exception {
        when(authService.login(loginRequest())).thenThrow(new BadCredentialsException("detalle interno"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Credenciales inválidas"))
                .andExpect(jsonPath("$.details").isEmpty())
                .andExpect(content().string(not(containsString("detalle interno"))));
    }

    @Test
    void login_blankFields_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "identifier": "", "password": "" }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.identifier").value("Identifier is required"))
                .andExpect(jsonPath("$.details.password").value("Password is required"));

        verify(authService, never()).login(any());
    }

    @Test
    void me_authenticatedPrincipal_returns200() throws Exception {
        SecurityPrincipal principal = new SecurityPrincipal(5L, "andrea", null,
                List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_USER")), true);
        when(authService.currentUser(principal))
                .thenReturn(new AuthenticatedUserResponse(5L, "andrea", List.of("USER")));

        mockMvc.perform(get("/api/auth/me")
                        .principal(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.username").value("andrea"))
                .andExpect(jsonPath("$.roles[0]").value("USER"));
    }

    @Test
    void me_withoutAuthentication_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        verify(authService, never()).currentUser(any());
    }
}