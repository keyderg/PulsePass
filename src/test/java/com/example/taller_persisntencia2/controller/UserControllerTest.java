package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.exception.DuplicateResourceException;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.taller_persisntencia2.service.AuthService;

@WebMvcTest(UserController.class)
class UserControllerTest extends SecuredControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserService userService;

    private static final String VALID_JSON = """
            {
              "username": "andrea",
              "email": "andrea@example.com",
              "firstName": "Andrea",
              "lastName": "Perez",
              "phone": "3001234567",
              "city": "Santa Marta",
              "birthDate": "2000-05-10",
              "password": "ClaveDePrueba2026!"
            }
            """;

    private RegisterUserRequest validRequest() {
        return new RegisterUserRequest("andrea", "andrea@example.com", "Andrea", "Perez",
                "3001234567", "Santa Marta", LocalDate.of(2000, 5, 10), "ClaveDePrueba2026!");
    }

    private UserResponse andrea() {
        return new UserResponse(1L, "andrea", "andrea@example.com", "Andrea", "Perez",
                LocalDate.of(2000, 5, 10), true);
    }

    // TEST-CTRL-USR-001
    @Test
    void register_validRequest_returns201() throws Exception {
        when(authService.register(validRequest())).thenReturn(andrea());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("andrea"))
                .andExpect(jsonPath("$.email").value("andrea@example.com"))
                .andExpect(jsonPath("$.birthDate").value("2000-05-10"))
                .andExpect(jsonPath("$.active").value(true));

        verify(authService).register(validRequest());
    }

    // TEST-CTRL-USR-002
    @Test
    void register_invalidEmail_returns400WithoutCallingService() throws Exception {
        String json = VALID_JSON.replace("andrea@example.com", "not-an-email");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.email").value("Email must be valid"));

        verify(authService, never()).register(any());
    }

    // Extra: varios campos inválidos a la vez
    @Test
    void register_missingRequiredFields_returns400WithAllDetails() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "",
                                  "firstName": "Andrea",
                                  "lastName": "Perez"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.username").value("Username is required"))
                .andExpect(jsonPath("$.details.email").value("Email is required"))
                .andExpect(jsonPath("$.details.birthDate").value("Birth date is required"));

        verify(authService, never()).register(any());
    }

    // Extra: JSON mal formado
    @Test
    void register_malformedJson_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed JSON request"));

        verify(authService, never()).register(any());
    }

    // TEST-CTRL-USR-003
    @Test
    void register_duplicateUsername_returns409() throws Exception {
        when(authService.register(validRequest()))
                .thenThrow(new DuplicateResourceException("Username already exists: andrea"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Username already exists: andrea"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(authService).register(validRequest());
    }

    // TEST-CTRL-USR-004
    @Test
    void findByEmail_existingUser_returns200() throws Exception {
        when(userService.findByEmail("andrea@example.com")).thenReturn(andrea());

        mockMvc.perform(get("/api/users/by-email").with(asUser()).param("email", "andrea@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.email").value("andrea@example.com"))
                .andExpect(jsonPath("$.username").value("andrea"));

        verify(userService).findByEmail("andrea@example.com");
    }

    // Extra: FR-CTRLUSR-002 pide 200 o 404
    @Test
    void findByEmail_unknownUser_returns404() throws Exception {
        when(userService.findByEmail("nadie@example.com"))
                .thenThrow(new ResourceNotFoundException("User not found: nadie@example.com"));

        mockMvc.perform(get("/api/users/by-email").with(asUser()).param("email", "nadie@example.com"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("User not found: nadie@example.com"));

        verify(userService).findByEmail("nadie@example.com");
    }

    // Extra: falta el parámetro email
    @Test
    void findByEmail_missingParam_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(get("/api/users/by-email").with(asUser()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.email").value("Parameter is required"));

        verify(userService, never()).findByEmail(any());
    }

    // TEST-CTRL-USR-005
    @Test
    void findByUsername_existingUser_returns200() throws Exception {
        when(userService.findByUsername("andrea")).thenReturn(andrea());

        mockMvc.perform(get("/api/users/by-username").with(asUser()).param("username", "andrea"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username").value("andrea"))
                .andExpect(jsonPath("$.firstName").value("Andrea"));

        verify(userService).findByUsername("andrea");
    }

    // Extra: FR-CTRLUSR-003 pide 200 o 404
    @Test
    void findByUsername_unknownUser_returns404() throws Exception {
        when(userService.findByUsername("nadie"))
                .thenThrow(new ResourceNotFoundException("User not found: nadie"));

        mockMvc.perform(get("/api/users/by-username").with(asUser())    .param("username", "nadie"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found: nadie"));

        verify(userService).findByUsername("nadie");

    }

    @Test
    void register_shortPassword_returns400WithoutCallingService() throws Exception {
        String json = VALID_JSON.replace("ClaveDePrueba2026!", "corta");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.password").value("Password must be at least 12 characters"));

        verify(authService, never()).register(any());
    }

    @Test
    void register_usernameTooLong_returns400WithoutCallingService() throws Exception {
        String json = VALID_JSON.replace(
                "\"username\": \"andrea\"",
                "\"username\": \"" + "a".repeat(51) + "\"");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.username").exists());

        verify(authService, never()).register(any());
    }

    @Test
    void register_passwordOver72Bytes_returns400WithoutCallingService() throws Exception {
        String json = VALID_JSON.replace("ClaveDePrueba2026!", "a".repeat(73));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.password").value("Password must not exceed 72 bytes"));

        verify(authService, never()).register(any());
    }

    @Test
    void security_anonymous_cannotLookUpUsers_gets401() throws Exception {
        mockMvc.perform(get("/api/users/by-email").param("email", "andrea@example.com"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/users/by-username").param("username", "andrea"))
                .andExpect(status().isUnauthorized());

        org.mockito.Mockito.verifyNoInteractions(userService);
    }
}