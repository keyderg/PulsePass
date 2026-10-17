package com.example.taller_persisntencia2.security;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserProfile;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

/**
 * Cuentas ADMIN y STAFF solo para desarrollo local (perfil "local"). Los roles privilegiados
 * nunca se crean por HTTP. Si la contraseña no está definida en una variable de entorno (o es
 * inválida), la cuenta simplemente no se crea: no existe ninguna contraseña por defecto.
 */
@Component
@Profile("local")
public class LocalAccountsSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalAccountsSeeder.class);

    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminPassword;
    private final String staffPassword;

    public LocalAccountsSeeder(UserRepository userRepository,
                               UserCredentialRepository credentialRepository,
                               UserRoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               @Value("${pulsepass.bootstrap.admin-password:}") String adminPassword,
                               @Value("${pulsepass.bootstrap.staff-password:}") String staffPassword) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword;
        this.staffPassword = staffPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seed("admin", "admin@pulsepass.local", "Admin", "PulsePass", Role.ADMIN, adminPassword);
        seed("laura", "laura@pulsepass.local", "Laura", "Staff", Role.STAFF, staffPassword);
    }

    private void seed(String username, String email, String firstName, String lastName,
                      Role role, String rawPassword) {
        if (rawPassword == null || rawPassword.length() < 12
                || rawPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            log.warn("seed_skipped username={} reason=password_missing_or_invalid", username);
            return;
        }
        if (userRepository.existsByUsername(username)) {
            return;   // idempotente
        }
        User user = new User(username, email);
        user.assignProfile(new UserProfile(firstName, lastName, LocalDate.of(1990, 1, 1)));
        User saved = userRepository.save(user);

        credentialRepository.save(new UserCredential(saved, passwordEncoder.encode(rawPassword)));
        roleRepository.save(new UserRole(saved.getId(), role));
        log.info("seed_created username={} role={}", username, role);
    }
}