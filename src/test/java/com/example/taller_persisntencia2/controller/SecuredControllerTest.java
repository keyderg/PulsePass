package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.security.CustomUserDetailsService;
import com.example.taller_persisntencia2.security.JwtService;
import com.example.taller_persisntencia2.security.RestAccessDeniedHandler;
import com.example.taller_persisntencia2.security.RestAuthenticationEntryPoint;
import com.example.taller_persisntencia2.security.SecurityConfig;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

/**
 * Base de los tests de controladores: carga la cadena de seguridad REAL (SecurityConfig, 401 y 403 en JSON)
 * sin deshabilitar filtros. La identidad se pone por request con asUser(), asStaff() o asAdmin().
 */
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
abstract class SecuredControllerTest {

    // SecurityConfig construye el filtro JWT con estos dos. Aquí la identidad se inyecta
    // directamente, así que basta con que existan como mocks.
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    static RequestPostProcessor asUser() {
        return identity(1L, "andrea", "USER");
    }

    static RequestPostProcessor asStaff() {
        return identity(2L, "laura", "STAFF");
    }

    static RequestPostProcessor asAdmin() {
        return identity(3L, "admin", "ADMIN");
    }

    static RequestPostProcessor identity(Long id, String username, String... roles) {
        List<GrantedAuthority> authorities = Arrays.stream(roles)
                .<GrantedAuthority>map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        SecurityPrincipal principal = new SecurityPrincipal(id, username, null, authorities, true);
        return authentication(UsernamePasswordAuthenticationToken.authenticated(principal, null, authorities));
    }
}