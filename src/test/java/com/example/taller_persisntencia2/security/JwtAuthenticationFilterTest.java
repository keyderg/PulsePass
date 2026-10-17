package com.example.taller_persisntencia2.security;

import com.example.taller_persisntencia2.exception.InvalidTokenException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtService jwtService;
    @Mock private CustomUserDetailsService userDetailsService;

    private JwtAuthenticationFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    // Lo que la cadena "ve" cuando el filtro le pasa el control.
    private final AtomicReference<Authentication> seen = new AtomicReference<>();
    private final AtomicBoolean chainCalled = new AtomicBoolean(false);
    private final FilterChain chain = (req, res) -> {
        chainCalled.set(true);
        seen.set(SecurityContextHolder.getContext().getAuthentication());
    };

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        filter = new JwtAuthenticationFilter(jwtService, userDetailsService);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private SecurityPrincipal principal(boolean active) {
        return new SecurityPrincipal(7L, "andrea", null,
                List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_USER")), active);
    }

    @Test
    void noAuthorizationHeader_continuesWithoutAuthenticating() throws Exception {
        filter.doFilter(request, response, chain);

        assertThat(chainCalled).isTrue();
        assertThat(seen.get()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void validBearer_authenticatesWithThePrincipalLoadedFromTheDatabase() throws Exception {
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateAndGetUserId("tok")).thenReturn(7L);
        when(userDetailsService.loadUserById(7L)).thenReturn(principal(true));

        filter.doFilter(request, response, chain);

        Authentication authentication = seen.get();
        assertThat(authentication).isNotNull();
        assertThat(authentication.isAuthenticated()).isTrue();
        assertThat(((SecurityPrincipal) authentication.getPrincipal()).getId()).isEqualTo(7L);
        assertThat(authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                .containsExactly("ROLE_USER");
        verify(userDetailsService).loadUserById(7L);
    }

    @Test
    void bearerSchemeIsCaseInsensitive() throws Exception {
        request.addHeader("Authorization", "bearer tok");
        when(jwtService.validateAndGetUserId("tok")).thenReturn(7L);
        when(userDetailsService.loadUserById(7L)).thenReturn(principal(true));

        filter.doFilter(request, response, chain);

        assertThat(seen.get()).isNotNull();
    }

    @Test
    void invalidBearer_doesNotAuthenticateButTheChainContinues() throws Exception {
        request.addHeader("Authorization", "Bearer malo");
        when(jwtService.validateAndGetUserId("malo")).thenThrow(new InvalidTokenException("Token inválido"));

        filter.doFilter(request, response, chain);

        assertThat(chainCalled).isTrue();
        assertThat(seen.get()).isNull();
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void inactiveUser_doesNotAuthenticate() throws Exception {
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateAndGetUserId("tok")).thenReturn(7L);
        when(userDetailsService.loadUserById(7L)).thenReturn(principal(false));

        filter.doFilter(request, response, chain);

        assertThat(seen.get()).isNull();
    }

    @Test
    void deletedUser_doesNotAuthenticate() throws Exception {
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateAndGetUserId("tok")).thenReturn(7L);
        when(userDetailsService.loadUserById(7L)).thenThrow(new UsernameNotFoundException("no existe"));

        filter.doFilter(request, response, chain);

        assertThat(seen.get()).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {"Bearer", "Bearer ", "Bearer    ", "Basic dXNlcjpwYXNz", "Token abc"})
    void headersThatAreNotARealBearerToken_areIgnored(String header) throws Exception {
        request.addHeader("Authorization", header);

        filter.doFilter(request, response, chain);

        assertThat(chainCalled).isTrue();
        assertThat(seen.get()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void twoAuthorizationHeaders_doNotAuthenticate() throws Exception {
        request.addHeader("Authorization", "Bearer uno");
        request.addHeader("Authorization", "Bearer dos");

        filter.doFilter(request, response, chain);

        assertThat(seen.get()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void tokenInQueryString_isIgnored() throws Exception {
        request.setParameter("access_token", "tok");

        filter.doFilter(request, response, chain);

        assertThat(seen.get()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void existingAuthentication_isNotOverwritten() throws Exception {
        Authentication existing = UsernamePasswordAuthenticationToken.authenticated("alguien", null, List.of());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(existing);
        SecurityContextHolder.setContext(context);
        request.addHeader("Authorization", "Bearer tok");

        filter.doFilter(request, response, chain);

        assertThat(seen.get()).isSameAs(existing);
        verifyNoInteractions(jwtService, userDetailsService);
    }
}