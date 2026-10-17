package com.example.taller_persisntencia2.security;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.repository.AuthUserRow;
import com.example.taller_persisntencia2.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService service;

    private static AuthUserRow row(Long id, boolean active, String hash, Role role) {
        return new AuthUserRow(id, "andrea", active, hash, role);
    }

    private static List<String> authorityNames(SecurityPrincipal principal) {
        return principal.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
    }

    @Test
    void loadUserByUsername_existingUser_returnsHashAndAllRoles() {
        when(userRepository.findAuthRowsByIdentifier("andrea")).thenReturn(List.of(
                row(1L, true, "HASH", Role.USER),
                row(1L, true, "HASH", Role.STAFF)));

        SecurityPrincipal principal = service.loadUserByUsername("andrea");

        assertThat(principal.getId()).isEqualTo(1L);
        assertThat(principal.getUsername()).isEqualTo("andrea");
        assertThat(principal.getPassword()).isEqualTo("HASH");
        assertThat(principal.isEnabled()).isTrue();
        assertThat(authorityNames(principal)).containsExactlyInAnyOrder("ROLE_USER", "ROLE_STAFF");
    }

    @Test
    void loadUserByUsername_unknownUser_throwsUsernameNotFound() {
        when(userRepository.findAuthRowsByIdentifier("nadie")).thenReturn(List.of());

        assertThatThrownBy(() -> service.loadUserByUsername("nadie"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void loadUserById_readsCurrentRolesOnEveryCall() {
        when(userRepository.findAuthRowsById(1L))
                .thenReturn(List.of(row(1L, true, null, Role.USER)))
                .thenReturn(List.of(row(1L, true, null, Role.USER), row(1L, true, null, Role.ADMIN)));

        assertThat(authorityNames(service.loadUserById(1L))).containsExactly("ROLE_USER");
        assertThat(authorityNames(service.loadUserById(1L))).containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN");

        verify(userRepository, times(2)).findAuthRowsById(1L); // sin caché: siempre a la base de datos
    }

    @Test
    void inactiveUser_isLoadedButDisabled() {
        when(userRepository.findAuthRowsById(1L)).thenReturn(List.of(row(1L, false, "HASH", Role.USER)));

        assertThat(service.loadUserById(1L).isEnabled()).isFalse();
    }

    @Test
    void legacyUserWithoutCredentials_cannotLoginButCanBeLoadedById() {
        List<AuthUserRow> legacy = List.of(row(1L, true, null, null));
        when(userRepository.findAuthRowsByIdentifier("legado")).thenReturn(legacy);
        when(userRepository.findAuthRowsById(1L)).thenReturn(legacy);

        assertThatThrownBy(() -> service.loadUserByUsername("legado"))
                .isInstanceOf(UsernameNotFoundException.class);

        SecurityPrincipal byId = service.loadUserById(1L);
        assertThat(byId.getPassword()).isNull();
        assertThat(byId.getAuthorities()).isEmpty();
    }

    @Test
    void ambiguousIdentifier_isTreatedAsNotFound() {
        when(userRepository.findAuthRowsByIdentifier("a@b.com")).thenReturn(List.of(
                row(1L, true, "HASH", Role.USER),
                row(2L, true, "HASH", Role.USER)));

        assertThatThrownBy(() -> service.loadUserByUsername("a@b.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}