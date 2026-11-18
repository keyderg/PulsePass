package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.dto.request.LoginRequest;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.AuthResponse;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.security.JwtService;
import com.example.taller_persisntencia2.service.AuthService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
@Transactional
class AuthLoginIT {

    private static final String PASSWORD = "ClaveDePrueba2026!"; // ficticia

    @Autowired private AuthService authService;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private EntityManager em;

    private UserResponse register(String username) {
        return authService.register(new RegisterUserRequest(username, username + "@test.com",
                "Andrea", "Perez", "3001234567", "Santa Marta", LocalDate.of(2000, 5, 10), PASSWORD));
    }

    @Test
    void loginWithUsernameShouldReturnValidTokenForPersistentId() {
        UserResponse registered = register("login_user");

        AuthResponse response = authService.login(new LoginRequest("login_user", PASSWORD));

        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(900L);
        assertThat(jwtService.validateAndGetUserId(response.accessToken())).isEqualTo(registered.id());
    }

    @Test
    void loginWithEmailShouldReturnToken() {
        UserResponse registered = register("login_mail");

        AuthResponse response = authService.login(new LoginRequest("LOGIN_MAIL@test.com", PASSWORD));

        assertThat(jwtService.validateAndGetUserId(response.accessToken())).isEqualTo(registered.id());
    }

    @Test
    void wrongPasswordShouldFailWithBadCredentials() {
        register("login_wrong");

        assertThatThrownBy(() -> authService.login(new LoginRequest("login_wrong", "OtraClaveDistinta1!")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void unknownUserShouldFailWithTheSameBadCredentials() {
        assertThatThrownBy(() -> authService.login(new LoginRequest("nadie", PASSWORD)))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void inactiveUserShouldNotGetToken() {
        UserResponse registered = register("login_inactive");
        User user = userRepository.findById(registered.id()).orElseThrow();
        user.setActive(false);
        userRepository.saveAndFlush(user);
        em.clear();

        assertThatThrownBy(() -> authService.login(new LoginRequest("login_inactive", PASSWORD)))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void legacyUserWithoutCredentialsShouldNotLogin() {
        userRepository.saveAndFlush(new User("login_legacy", "login_legacy@test.com"));
        em.clear();

        assertThatThrownBy(() -> authService.login(new LoginRequest("login_legacy", PASSWORD)))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void passwordLongerThan72BytesShouldFailWithBadCredentialsNotServerError() {
        register("login_longpass");

        assertThatThrownBy(() -> authService.login(new LoginRequest("login_longpass", "a".repeat(100))))
                .isInstanceOf(BadCredentialsException.class);
    }
}