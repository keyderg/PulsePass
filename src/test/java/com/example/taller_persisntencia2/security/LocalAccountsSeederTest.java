package com.example.taller_persisntencia2.security;

import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.atomic.AtomicLong;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocalAccountsSeederTest {

    private static final String ADMIN_PASSWORD = "una-frase-larga-admin-2026"; // ficticia
    private static final String STAFF_PASSWORD = "una-frase-larga-staff-2026"; // ficticia

    @Mock private UserRepository userRepository;
    @Mock private UserCredentialRepository credentialRepository;
    @Mock private UserRoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private LocalAccountsSeeder seeder(String adminPassword, String staffPassword) {
        return new LocalAccountsSeeder(userRepository, credentialRepository, roleRepository,
                passwordEncoder, adminPassword, staffPassword);
    }

    @Test
    void createsAdminAndStaffAccounts() {
        AtomicLong ids = new AtomicLong(1);
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", ids.getAndIncrement());
            return user;
        });
        when(passwordEncoder.encode(any())).thenReturn("hash-de-prueba");

        seeder(ADMIN_PASSWORD, STAFF_PASSWORD).run(null);

        verify(userRepository, times(2)).save(any(User.class));
        verify(credentialRepository, times(2)).save(any(UserCredential.class));
        verify(roleRepository, times(2)).save(any(UserRole.class));
    }

    @Test
    void skipsAccountsWhenPasswordIsMissingOrTooShort() {
        seeder("", "corta").run(null);

        verifyNoInteractions(userRepository, credentialRepository, roleRepository);
    }

    @Test
    void isIdempotentWhenAccountsAlreadyExist() {
        when(userRepository.existsByUsername(any())).thenReturn(true);

        seeder(ADMIN_PASSWORD, STAFF_PASSWORD).run(null);

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(credentialRepository, roleRepository);
    }
}