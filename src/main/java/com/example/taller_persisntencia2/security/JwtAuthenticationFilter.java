package com.example.taller_persisntencia2.security;

import com.example.taller_persisntencia2.exception.InvalidTokenException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * Lee SOLO el header Authorization: Bearer. Un token inválido nunca autentica; sin header deja
 * que la cadena decida (rutas públicas pasan, las protegidas devuelven 401 por el EntryPoint).
 * El usuario y sus roles se cargan de la base de datos en cada request.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // No pisamos una autenticación que ya exista.
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = extractBearerToken(request);
            if (token != null) {
                authenticate(token, request);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String extractBearerToken(HttpServletRequest request) {
        Enumeration<String> values = request.getHeaders(HttpHeaders.AUTHORIZATION);
        List<String> headers = values == null ? List.of() : Collections.list(values);

        // Sin header, o más de uno (sospechoso): no se autentica.
        if (headers.size() != 1) {
            return null;
        }
        String header = headers.get(0);
        if (header == null
                || header.length() <= BEARER_PREFIX.length()
                || !header.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            return null; // otro esquema (Basic, etc.) o token vacío
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }

    private void authenticate(String token, HttpServletRequest request) {
        try {
            Long userId = jwtService.validateAndGetUserId(token);
            SecurityPrincipal principal = userDetailsService.loadUserById(userId);

            if (!principal.isEnabled()) {
                return; // usuario desactivado: pierde acceso en el siguiente request
            }

            UsernamePasswordAuthenticationToken authentication =
                    UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

        } catch (InvalidTokenException | UsernameNotFoundException e) {
            SecurityContextHolder.clearContext();
            log.debug("Bearer rechazado: {}", e.getClass().getSimpleName()); // nunca el token
        }
    }
}