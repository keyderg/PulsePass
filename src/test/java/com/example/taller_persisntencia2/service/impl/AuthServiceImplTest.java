package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.dto.request.LoginRequest;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.AuthResponse;
import com.example.taller_persisntencia2.dto.response.AuthenticatedUserResponse;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.exception.DuplicateResourceException;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import com.example.taller_persisntencia2.security.JwtService;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import com.example.taller_persisntencia2.service.AuthService;
import com.example.taller_persisntencia2.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    private static final String PASSWORD = "ClaveDePrueba2026!"; // ficticia

    @Mock private UserService userService;
    @Mock private UserRepository userRepository;
    @Mock private UserCredentialRepository credentialRepository;
    @Mock private UserRoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private RegisterUserRequest registerRequest() {
        return new RegisterUserRequest("andrea", "andrea@test.com", "Andrea", "Perez",
                "3001234567", "Santa Marta", LocalDate.of(2000, 5, 10), PASSWORD);
    }

    private UserResponse createdUser() {
        return new UserResponse(5L, "andrea", "andrea@test.com", "Andrea", "Perez",
                LocalDate.of(2000, 5, 10), true);
    }

    private SecurityPrincipal principal(Long id, String... roles) {
        List<GrantedAuthority> authorities = java.util.Arrays.stream(roles)
                .<GrantedAuthority>map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
        return new SecurityPrincipal(id, "andrea", "HASH", authorities, true);
    }

    // ---------- register ----------

    @Test
    void register_savesHashedCredentialAndUserRole() {
        when(userService.register(registerRequest())).thenReturn(createdUser());
        when(userRepository.findById(5L)).thenReturn(Optional.of(new User("andrea", "andrea@test.com")));
        when(passwordEncoder.encode(PASSWORD)).thenReturn("HASH-BCRYPT");

        UserResponse response = authService.register(registerRequest());

        assertThat(response).isEqualTo(createdUser());

        ArgumentCaptor<UserCredential> credential = ArgumentCaptor.forClass(UserCredential.class);
        verify(credentialRepository).save(credential.capture());
        assertThat(credential.getValue().getPasswordHash()).isEqualTo("HASH-BCRYPT").isNotEqualTo(PASSWORD);

        ArgumentCaptor<UserRole> role = ArgumentCaptor.forClass(UserRole.class);
        verify(roleRepository).save(role.capture());
        assertThat(role.getValue().getUserId()).isEqualTo(5L);
        assertThat(role.getValue().getRole()).isEqualTo(Role.USER); // nunca un rol que venga del cliente
    }

    @Test
    void register_whenUserServiceFails_savesNothingElse() {
        when(userService.register(any())).thenThrow(new DuplicateResourceException("El username ya existe"));

        assertThatThrownBy(() -> authService.register(registerRequest()))
                .isInstanceOf(DuplicateResourceException.class);

        verifyNoInteractions(passwordEncoder, credentialRepository, roleRepository);
    }

    @Test
    void register_whenHashingFails_savesNeitherCredentialNorRole() {
        when(userService.register(any())).thenReturn(createdUser());
        when(userRepository.findById(5L)).thenReturn(Optional.of(new User("andrea", "andrea@test.com")));
        when(passwordEncoder.encode(any())).thenThrow(new IllegalStateException("fallo simulado"));

        assertThatThrownBy(() -> authService.register(registerRequest()))
                .isInstanceOf(IllegalStateException.class);

        verify(credentialRepository, never()).save(any());
        verify(roleRepository, never()).save(any());
    }

    // ---------- login ----------

    @Test
    void login_success_returnsBearerTokenForPersistentId() {
        SecurityPrincipal principal = principal(7L, "USER");
        when(authenticationManager.authenticate(any()))
                .thenReturn(UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        when(jwtService.generateToken(7L)).thenReturn("jwt-de-prueba");
        when(jwtService.getAccessTokenTtlSeconds()).thenReturn(900L);

        AuthResponse response = authService.login(new LoginRequest("andrea", PASSWORD));

        assertThat(response).isEqualTo(new AuthResponse("jwt-de-prueba", "Bearer", 900L));

        ArgumentCaptor<Authentication> sent = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(sent.capture());
        assertThat(sent.getValue().getPrincipal()).isEqualTo("andrea");
        assertThat(sent.getValue().getCredentials()).isEqualTo(PASSWORD);
        assertThat(sent.getValue().isAuthenticated()).isFalse();
    }

    @Test
    void login_wrongPassword_propagatesAndNeverIssuesToken() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("detalle interno"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("andrea", "incorrecta")))
                .isInstanceOf(BadCredentialsException.class);

        verifyNoInteractions(jwtService);
    }

    @Test
    void login_inactiveUser_propagatesAndNeverIssuesToken() {
        when(authenticationManager.authenticate(any())).thenThrow(new DisabledException("User is disabled"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("andrea", PASSWORD)))
                .isInstanceOf(DisabledException.class);

        verifyNoInteractions(jwtService);
    }

    // ---------- currentUser ----------

    @Test
    void currentUser_returnsMinimalDataWithRolesWithoutPrefix() {
        AuthenticatedUserResponse response = authService.currentUser(principal(3L, "USER", "ADMIN"));

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.username()).isEqualTo("andrea");
        assertThat(response.roles()).containsExactly("ADMIN", "USER");
    }
}