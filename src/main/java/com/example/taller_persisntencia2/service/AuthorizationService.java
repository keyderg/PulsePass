package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.repository.TicketRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Políticas de propiedad y visibilidad. Se usa desde @PreAuthorize ("@authorizationService...")
 * y desde EventServiceImpl. Nunca confía en un id o correo enviado por el cliente como identidad:
 * compara siempre con el id persistente del principal.
 */
@Service
public class AuthorizationService {

    private static final String ROLE_PREFIX = "ROLE_";

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public AuthorizationService(UserRepository userRepository, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    /** STAFF y ADMIN pueden ver eventos que no están publicados. */
    public boolean canSeeUnpublishedEvents() {
        return hasAnyRole("STAFF", "ADMIN");
    }

    /** ¿Ese correo pertenece al usuario autenticado? (403 si no; no revela si el correo existe). */
    public boolean isPrincipalEmail(String email) {
        return email != null && isPrincipal(userRepository.findIdByEmail(email));
    }

    public boolean isPrincipalUsername(String username) {
        return username != null && isPrincipal(userRepository.findIdByUsername(username));
    }

    /** Ver un ticket: dueño, STAFF o ADMIN. Si es ajeno responde 404, igual que si no existiera. */
    public boolean canViewTicket(String ticketCode) {
        return canAccessTicket(ticketCode, "STAFF", "ADMIN");
    }

    /** Cancelar un ticket: dueño o ADMIN. Si es ajeno (STAFF incluido) responde 404. */
    public boolean canCancelTicket(String ticketCode) {
        return canAccessTicket(ticketCode, "ADMIN");
    }

    private boolean canAccessTicket(String ticketCode, String... privilegedRoles) {
        Optional<SecurityPrincipal> principal = currentPrincipal();
        if (principal.isEmpty()) {
            return false; // sin identidad (en la práctica la ruta ya exige token)
        }
        Optional<Long> ownerId = ticketRepository.findOwnerIdByTicketCode(ticketCode);
        if (ownerId.isEmpty()) {
            return true; // no existe: que el Service responda su 404 normal
        }
        if (ownerId.get().equals(principal.get().getId()) || hasAnyRole(privilegedRoles)) {
            return true;
        }
        // Ajeno: mismo mensaje que cuando el ticket no existe, para no revelar que existe.
        throw new ResourceNotFoundException("Ticket no encontrado");
    }

    private boolean isPrincipal(Optional<Long> requestedUserId) {
        return currentPrincipal()
                .map(SecurityPrincipal::getId)
                .flatMap(principalId -> requestedUserId.filter(principalId::equals))
                .isPresent();
    }

    private Optional<SecurityPrincipal> currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof SecurityPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    private boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        Set<String> wanted = Arrays.stream(roles).map(r -> ROLE_PREFIX + r).collect(Collectors.toSet());
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(wanted::contains);
    }
}