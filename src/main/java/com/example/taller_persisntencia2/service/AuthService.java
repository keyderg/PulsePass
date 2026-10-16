package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.dto.request.LoginRequest;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.AuthResponse;
import com.example.taller_persisntencia2.dto.response.AuthenticatedUserResponse;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import com.example.taller_persisntencia2.security.JwtService;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String TOKEN_TYPE = "Bearer";
    private static final String ROLE_PREFIX = "ROLE_";

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserService userService,
                       UserRepository userRepository,
                       UserCredentialRepository credentialRepository,
                       UserRoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /**
     * Registro público: User + UserProfile (reglas de UserService), hash BCrypt y ROLE_USER
     * en UNA sola transacción. El rol siempre es USER: nunca viene del cliente.
     */
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        UserResponse created = userService.register(request);
        User user = userRepository.findById(created.id()).orElseThrow();

        credentialRepository.save(new UserCredential(user, passwordEncoder.encode(request.password())));
        roleRepository.save(new UserRole(created.id(), Role.USER));

        return created;
    }

    /**
     * Login por username o correo. Si algo falla (usuario inexistente, contraseña incorrecta,
     * usuario inactivo, usuario sin credenciales) se propaga una AuthenticationException y el
     * handler responde siempre el mismo 401 genérico.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.identifier(), request.password()));
        } catch (AuthenticationException e) {
            log.warn("Login fallido"); // sin identifier: a veces la gente escribe la contraseña en ese campo
            throw e;
        }

        SecurityPrincipal principal = (SecurityPrincipal) authentication.getPrincipal();
        log.info("Login correcto userId={}", principal.getId());

        return new AuthResponse(
                jwtService.generateToken(principal.getId()),
                TOKEN_TYPE,
                jwtService.getAccessTokenTtlSeconds());
    }

    /** Datos mínimos del usuario autenticado: sin correo, sin hash. Roles como USER/STAFF/ADMIN. */
    public AuthenticatedUserResponse currentUser(SecurityPrincipal principal) {
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.startsWith(ROLE_PREFIX) ? a.substring(ROLE_PREFIX.length()) : a)
                .sorted()
                .toList();
        return new AuthenticatedUserResponse(principal.getId(), principal.getUsername(), roles);
    }
}