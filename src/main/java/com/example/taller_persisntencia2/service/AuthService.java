package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.domain.Role;
import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserCredential;
import com.example.taller_persisntencia2.domain.UserRole;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.repository.UserCredentialRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.UserRoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserService userService,
                       UserRepository userRepository,
                       UserCredentialRepository credentialRepository,
                       UserRoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registro público: User + UserProfile (reglas de UserService), hash BCrypt y ROLE_USER
     * en UNA sola transacción. Si algo falla después de crear el usuario, todo se revierte.
     * El rol siempre es USER: nunca viene del cliente.
     */
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        // UserService.register es @Transactional (REQUIRED): se une a esta transacción.
        UserResponse created = userService.register(request);

        // El User ya está en el contexto de persistencia de esta transacción: no hay consulta extra.
        User user = userRepository.findById(created.id()).orElseThrow();

        credentialRepository.save(new UserCredential(user, passwordEncoder.encode(request.password())));
        roleRepository.save(new UserRole(created.id(), Role.USER));

        return created;
    }
    }