package com.example.taller_persisntencia2.security;

import com.example.taller_persisntencia2.repository.AuthUserRow;
import com.example.taller_persisntencia2.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Login: identifier puede ser username o correo. Exige que el usuario tenga credenciales. */
    @Override
    @Transactional(readOnly = true)
    public SecurityPrincipal loadUserByUsername(String identifier) {
        SecurityPrincipal principal = toPrincipal(userRepository.findAuthRowsByIdentifier(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        if (principal.getPassword() == null) {
            // Usuario legado sin credenciales: no puede iniciar sesión.
            throw new UsernameNotFoundException("Usuario no encontrado");
        }
        return principal;
    }

    /** Filtro JWT: revalida usuario, estado y roles actuales en cada request, usando el id del claim "sub". */
    @Transactional(readOnly = true)
    public SecurityPrincipal loadUserById(Long id) {
        return toPrincipal(userRepository.findAuthRowsById(id))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    private Optional<SecurityPrincipal> toPrincipal(List<AuthUserRow> rows) {
        if (rows.isEmpty()) {
            return Optional.empty();
        }
        AuthUserRow first = rows.get(0);

        // Si el identifier coincidiera con usuarios distintos (p. ej. un username igual al correo
        // de otro), es ambiguo: se trata como no encontrado.
        boolean ambiguous = rows.stream().anyMatch(r -> !r.id().equals(first.id()));
        if (ambiguous) {
            return Optional.empty();
        }

        List<GrantedAuthority> authorities = rows.stream()
                .map(AuthUserRow::role)
                .filter(Objects::nonNull)
                .distinct()
                .<GrantedAuthority>map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();

        return Optional.of(new SecurityPrincipal(
                first.id(), first.username(), first.passwordHash(),
                authorities, Boolean.TRUE.equals(first.active())));
    }
}