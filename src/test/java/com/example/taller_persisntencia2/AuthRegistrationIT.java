package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import com.example.taller_persisntencia2.service.AuthService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

/**
 * Sin @Transactional a propósito: AuthService maneja su propia transacción y queremos
 * ver si hace commit o rollback de verdad. Por eso limpiamos los datos al final.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class AuthRegistrationIT {

    private static final String PASSWORD = "ClaveDePrueba2026!"; // ficticia
    private static final List<String> USERNAMES = List.of("atomic_ok", "atomic_fail");

    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private UserCredentialRepository credentialRepository;
    @Autowired private UserRoleRepository roleRepository;
    @MockitoSpyBean private PasswordEncoder passwordEncoder;

    private RegisterUserRequest request(String username) {
        return new RegisterUserRequest(username, username + "@test.com", "Andrea", "Perez",
                "3001234567", "Santa Marta", LocalDate.of(2000, 5, 10), PASSWORD);
    }

    @AfterEach
    void cleanUp() {
        USERNAMES.forEach(u -> userRepository.findByUsername(u).ifPresent(userRepository::delete));
    }

    @Test
    void registerShouldCreateUserHashedCredentialAndUserRole() {
        UserResponse response = authService.register(request("atomic_ok"));

        assertThat(response.id()).isNotNull();

        UserCredential credential = credentialRepository.findById(response.id()).orElseThrow();
        assertThat(credential.getPasswordHash()).isNotEqualTo(PASSWORD).startsWith("$2");
        assertThat(passwordEncoder.matches(PASSWORD, credential.getPasswordHash())).isTrue();

        assertThat(roleRepository.findByIdUserId(response.id()))
                .extracting(UserRole::getRole)
                .containsExactly(Role.USER);
    }

    @Test
    void registerShouldRollbackUserWhenCredentialCreationFails() {
        doThrow(new IllegalStateException("fallo simulado")).when(passwordEncoder).encode(any());

        assertThatThrownBy(() -> authService.register(request("atomic_fail")))
                .isInstanceOf(IllegalStateException.class);

        // Si la transacción fuera parcial, el usuario quedaría guardado sin credenciales.
        assertThat(userRepository.findByUsername("atomic_fail")).isEmpty();
    }
}