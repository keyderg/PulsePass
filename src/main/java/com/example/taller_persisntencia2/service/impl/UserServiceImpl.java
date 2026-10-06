package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserProfile;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.exception.BusinessRuleException;
import com.example.taller_persisntencia2.exception.DuplicateResourceException;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.mapper.UserMapper;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        // BR-USER-005: birthDate no puede ser futura
        if (request.birthDate().isAfter(LocalDate.now())) {
            throw new BusinessRuleException("La fecha de nacimiento no puede ser futura");
        }

        // BR-USER-001: username debe ser único
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("El username ya está registrado");
        }

        // BR-USER-002: email debe ser único
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("El email ya está registrado");
        }

        // BR-USER-004: Crear User y UserProfile juntos
        // BR-USER-003: Todo usuario nuevo inicia con active = true (manejado por la entidad)
        User user = new User(request.username(), request.email());

        UserProfile profile = new UserProfile(request.firstName(), request.lastName(), request.birthDate());
        profile.setPhone(request.phone());
        profile.setCity(request.city());


        user.assignProfile(profile);

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con username: " + username));
    }
}