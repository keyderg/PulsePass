package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
@Transactional
class SecurityMigrationIT {

    private static final String FAKE_HASH =
            "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ0123"; // ficticio

    @Autowired private JdbcTemplate jdbc;
    @Autowired private EntityManager em;
    @Autowired private UserRepository userRepository;
    @Autowired private UserCredentialRepository credentialRepository;
    @Autowired private UserRoleRepository roleRepository;

    private Long insertUserWithJdbc(String username) {
        return jdbc.queryForObject(
                "INSERT INTO users (username, email) VALUES (?, ?) RETURNING id",
                Long.class, username, username + "@test.com");
    }

    @Test
    void v4ShouldBeAppliedSuccessfully() {
        Integer ok = jdbc.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '4' AND success = true",
                Integer.class);
        assertThat(ok).isEqualTo(1);
    }

    @Test
    void shouldCreateTablesWithExpectedColumns() {
        List<String> credentialCols = jdbc.queryForList(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'user_credentials'",
                String.class);
        List<String> roleCols = jdbc.queryForList(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'user_roles'",
                String.class);

        assertThat(credentialCols).containsExactlyInAnyOrder("user_id", "password_hash", "password_changed_at");
        assertThat(roleCols).containsExactlyInAnyOrder("user_id", "role");
    }

    @Test
    void legacyUserWithoutCredentialsShouldHaveNoCredentialRow() {
        Long id = insertUserWithJdbc("legacy");

        Integer credentials = jdbc.queryForObject(
                "SELECT COUNT(*) FROM user_credentials WHERE user_id = ?", Integer.class, id);
        Integer roles = jdbc.queryForObject(
                "SELECT COUNT(*) FROM user_roles WHERE user_id = ?", Integer.class, id);

        assertThat(credentials).isZero();
        assertThat(roles).isZero();
        assertThat(credentialRepository.findById(id)).isEmpty();
    }

    @Test
    void shouldPersistCredentialAndRolesThroughRepositories() {
        User user = userRepository.save(new User("andrea", "andrea@test.com"));
        credentialRepository.save(new UserCredential(user, FAKE_HASH));
        roleRepository.save(new UserRole(user.getId(), Role.USER));
        roleRepository.save(new UserRole(user.getId(), Role.STAFF));
        em.flush();
        em.clear();

        UserCredential found = credentialRepository.findById(user.getId()).orElseThrow();
        assertThat(found.getPasswordHash()).isEqualTo(FAKE_HASH);
        assertThat(found.getPasswordChangedAt()).isNotNull();

        assertThat(roleRepository.findByIdUserId(user.getId()))
                .extracting(UserRole::getRole)
                .containsExactlyInAnyOrder(Role.USER, Role.STAFF);
    }

    @Test
    void shouldRejectNullPasswordHash() {
        Long id = insertUserWithJdbc("nohash");

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO user_credentials (user_id, password_hash) VALUES (?, NULL)", id))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldRejectSecondCredentialForSameUser() {
        Long id = insertUserWithJdbc("dupcred");
        jdbc.update("INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)", id, FAKE_HASH);

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)", id, FAKE_HASH))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldRejectCredentialForNonExistentUser() {
        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)", -1L, FAKE_HASH))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldRejectInvalidRole() {
        Long id = insertUserWithJdbc("badrole");

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO user_roles (user_id, role) VALUES (?, 'SUPERADMIN')", id))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldRejectDuplicateUserRole() {
        Long id = insertUserWithJdbc("duprole");
        jdbc.update("INSERT INTO user_roles (user_id, role) VALUES (?, 'USER')", id);

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO user_roles (user_id, role) VALUES (?, 'USER')", id))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}