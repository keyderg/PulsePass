package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.repository.TicketRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import com.example.taller_persisntencia2.service.AuthorizationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private TicketRepository ticketRepository;

    @InjectMocks
    private AuthorizationService authorizationService;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void loginAs(Long userId, String... roles) {
        List<GrantedAuthority> authorities = Arrays.stream(roles)
                .<GrantedAuthority>map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
        SecurityPrincipal principal = new SecurityPrincipal(userId, "user" + userId, null, authorities, true);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(principal, null, authorities));
        SecurityContextHolder.setContext(context);
    }

    // ---------- correo / username: compara ids persistentes ----------

    @Test
    void isPrincipalEmail_ownEmail_isTrue() {
        loginAs(1L, "USER");
        when(userRepository.findIdByEmail("andrea@test.com")).thenReturn(Optional.of(1L));

        assertThat(authorizationService.isPrincipalEmail("andrea@test.com")).isTrue();
    }

    @Test
    void isPrincipalEmail_anotherUsersEmail_isFalse() {
        loginAs(1L, "USER");
        when(userRepository.findIdByEmail("carlos@test.com")).thenReturn(Optional.of(2L));

        assertThat(authorizationService.isPrincipalEmail("carlos@test.com")).isFalse();
    }

    @Test
    void isPrincipalEmail_unknownEmail_isFalseLikeAnyoneElses() {
        loginAs(1L, "USER");
        when(userRepository.findIdByEmail("fantasma@test.com")).thenReturn(Optional.empty());

        assertThat(authorizationService.isPrincipalEmail("fantasma@test.com")).isFalse();
    }

    @Test
    void isPrincipalEmail_nullOrAnonymous_isFalse() {
        assertThat(authorizationService.isPrincipalEmail(null)).isFalse();

        when(userRepository.findIdByEmail("andrea@test.com")).thenReturn(Optional.of(1L));
        assertThat(authorizationService.isPrincipalEmail("andrea@test.com")).isFalse(); // sin identidad
    }

    @Test
    void isPrincipalUsername_ownIsTrueAndOthersFalse() {
        loginAs(1L, "USER");
        when(userRepository.findIdByUsername("andrea")).thenReturn(Optional.of(1L));
        when(userRepository.findIdByUsername("carlos")).thenReturn(Optional.of(2L));

        assertThat(authorizationService.isPrincipalUsername("andrea")).isTrue();
        assertThat(authorizationService.isPrincipalUsername("carlos")).isFalse();
    }

    // ---------- ver ticket: dueño, STAFF o ADMIN ----------

    @Test
    void canViewTicket_owner_isTrue() {
        loginAs(1L, "USER");
        when(ticketRepository.findOwnerIdByTicketCode("T-1")).thenReturn(Optional.of(1L));

        assertThat(authorizationService.canViewTicket("T-1")).isTrue();
    }

    @Test
    void canViewTicket_staffAndAdminOnSomeoneElsesTicket_isTrue() {
        when(ticketRepository.findOwnerIdByTicketCode("T-1")).thenReturn(Optional.of(1L));

        loginAs(9L, "STAFF");
        assertThat(authorizationService.canViewTicket("T-1")).isTrue();

        loginAs(10L, "ADMIN");
        assertThat(authorizationService.canViewTicket("T-1")).isTrue();
    }

    @Test
    void canViewTicket_userOnSomeoneElsesTicket_isfalse() {
        loginAs(2L, "USER");
        when(ticketRepository.findOwnerIdByTicketCode("T-1")).thenReturn(Optional.of(1L));

        assertThat(authorizationService.canViewTicket("T-1")).isFalse();
    }

    @Test
    void canViewTicket_nonExistentTicketForUser_isFalse() {
        loginAs(2L, "USER");
        when(ticketRepository.findOwnerIdByTicketCode("NO-EXISTE")).thenReturn(Optional.empty());

        assertThat(authorizationService.canViewTicket("NO-EXISTE")).isFalse();
    }

    @Test
    void canViewTicket_anonymous_isFalseWithoutTouchingTheDatabase() {
        assertThat(authorizationService.canViewTicket("T-1")).isFalse();

        verifyNoInteractions(ticketRepository);
    }

    // ---------- cancelar ticket: dueño o ADMIN (STAFF no) ----------

    @Test
    void canCancelTicket_ownerAndAdmin_areAllowed() {
        when(ticketRepository.findOwnerIdByTicketCode("T-1")).thenReturn(Optional.of(1L));

        loginAs(1L, "USER");
        assertThat(authorizationService.canCancelTicket("T-1")).isTrue();

        loginAs(10L, "ADMIN");
        assertThat(authorizationService.canCancelTicket("T-1")).isTrue();
    }

    @Test
    void canCancelTicket_staffAndUserOnSomeoneElsesTicket_areDenied() {
        when(ticketRepository.findOwnerIdByTicketCode("T-1")).thenReturn(Optional.of(1L));

        loginAs(9L, "STAFF");
        assertThat(authorizationService.canCancelTicket("T-1")).isFalse();

        loginAs(2L, "USER");
        assertThat(authorizationService.canCancelTicket("T-1")).isFalse();
    }

    // ---------- eventos no publicados ----------

    @Test
    void canSeeUnpublishedEvents_onlyStaffAndAdmin() {
        loginAs(1L, "STAFF");
        assertThat(authorizationService.canSeeUnpublishedEvents()).isTrue();

        loginAs(2L, "ADMIN");
        assertThat(authorizationService.canSeeUnpublishedEvents()).isTrue();

        loginAs(3L, "USER");
        assertThat(authorizationService.canSeeUnpublishedEvents()).isFalse();

        SecurityContextHolder.clearContext();
        assertThat(authorizationService.canSeeUnpublishedEvents()).isFalse();
    }
}