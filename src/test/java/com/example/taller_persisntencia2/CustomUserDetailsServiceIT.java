package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import com.example.taller_persisntencia2.security.CustomUserDetailsService;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
@Transactional
class CustomUserDetailsServiceIT {

    private static final String RAW_PASSWORD = "ClaveDePrueba2026!"; // ficticia

    @Autowired private CustomUserDetailsService service;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private UserRepository userRepository;
    @Autowired private UserCredentialRepository credentialRepository;
    @Autowired private UserRoleRepository roleRepository;
    @Autowired private EntityManager em;

    private User createUser(String username, boolean active, boolean withCredential, Role... roles) {
        User user = new User(username, username + "@test.com");
        user.setActive(active);
        userRepository.save(user);
        if (withCredential) {
            credentialRepository.save(new UserCredential(user, passwordEncoder.encode(RAW_PASSWORD)));
        }
        for (Role role : roles) {
            roleRepository.save(new UserRole(user.getId(), role));
        }
        em.flush();
        em.clear();
        return user;
    }

    private static java.util.List<String> authorityNames(SecurityPrincipal p) {
        return p.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
    }

    @Test
    void shouldLoadByUsernameWithHashAndRoles() {
        User user = createUser("andrea", true, true, Role.USER, Role.STAFF);

        SecurityPrincipal principal = service.loadUserByUsername("andrea");

        assertThat(principal.getId()).isEqualTo(user.getId());
        assertThat(principal.getUsername()).isEqualTo("andrea");
        assertThat(principal.isEnabled()).isTrue();
        assertThat(authorityNames(principal)).containsExactlyInAnyOrder("ROLE_USER", "ROLE_STAFF");
        assertThat(passwordEncoder.matches(RAW_PASSWORD, principal.getPassword())).isTrue();
    }

    @Test
    void shouldLoadByEmailIgnoringCase() {
        User user = createUser("carlos", true, true, Role.USER);

        SecurityPrincipal principal = service.loadUserByUsername("CARLOS@Test.com");

        assertThat(principal.getId()).isEqualTo(user.getId());
    }

    @Test
    void shouldLoadByIdWithCurrentRoles() {
        User user = createUser("laura", true, true, Role.USER);
        assertThat(authorityNames(service.loadUserById(user.getId()))).containsExactly("ROLE_USER");

        roleRepository.saveAndFlush(new UserRole(user.getId(), Role.ADMIN));
        em.clear();

        assertThat(authorityNames(service.loadUserById(user.getId())))
                .containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN");
    }

    @Test
    void inactiveUserShouldBeDisabled() {
        User user = createUser("inactivo", false, true, Role.USER);

        assertThat(service.loadUserByUsername("inactivo").isEnabled()).isFalse();
        assertThat(service.loadUserById(user.getId()).isEnabled()).isFalse();
    }

    @Test
    void legacyUserWithoutCredentialsCannotLogin() {
        User user = createUser("legado", true, false);

        assertThatThrownBy(() -> service.loadUserByUsername("legado"))
                .isInstanceOf(UsernameNotFoundException.class);
        assertThat(service.loadUserById(user.getId()).getAuthorities()).isEmpty();
    }

    @Test
    void unknownUserShouldThrowUsernameNotFound() {
        assertThatThrownBy(() -> service.loadUserByUsername("nadie"))
                .isInstanceOf(UsernameNotFoundException.class);
        assertThatThrownBy(() -> service.loadUserById(-1L))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}