package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.domain.User;
import com.example.taller_persisntencia2.domain.UserProfile;
import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import com.example.taller_persisntencia2.exception.BusinessRuleException;
import com.example.taller_persisntencia2.exception.DuplicateResourceException;
import com.example.taller_persisntencia2.mapper.UserMapper;
import com.example.taller_persisntencia2.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void testUser001_RegisterWithFutureBirthDateThrowsBusinessRuleException() {
        // ARRANGE
        RegisterUserRequest request = new RegisterUserRequest(
                "john_doe",
                "john@example.com",
                "John",
                "Doe",
                "123456789",
                "Santa Marta",
                LocalDate.now().plusDays(1) // Fecha futura inválida
        );

        // ACT & ASSERT
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("La fecha de nacimiento no puede ser futura");

        // ASSERT: Nunca debe intentar guardar en la base de datos
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUser002_RegisterWithExistingUsernameThrowsDuplicateResourceException() {
        // ARRANGE
        RegisterUserRequest request = new RegisterUserRequest(
                "existing_user",
                "new@example.com",
                "John",
                "Doe",
                "123456789",
                "Santa Marta",
                LocalDate.of(1995, 5, 15)
        );

        when(userRepository.existsByUsername("existing_user")).thenReturn(true);

        // ACT & ASSERT
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("El username ya está registrado");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUser003_SuccessfulRegistrationReturnsUserResponse() {
        // ARRANGE
        RegisterUserRequest request = new RegisterUserRequest(
                "new_user",
                "new@example.com",
                "Calixto",
                "Diaz",
                "3001234567",
                "Santa Marta",
                LocalDate.of(2000, 1, 1)
        );

        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);

        // Mock del guardado simulando la entidad y el perfil
        User savedUser = new User(request.username(), request.email());
        UserProfile profile = new UserProfile(request.firstName(), request.lastName(), request.birthDate());
        savedUser.assignProfile(profile);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse expectedResponse = new UserResponse(
                1L, request.username(), request.email(), request.firstName(), request.lastName(), request.birthDate(), true
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(expectedResponse);

        // ACT
        UserResponse result = userService.register(request);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.username()).isEqualTo(request.username());
        assertThat(result.email()).isEqualTo(request.email());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testUser004_SuccessfulRegistrationReturnsUserResponse() {
        RegisterUserRequest request = new RegisterUserRequest(
                "new_user", "new@example.com", "Calixto", "Diaz", "3001234567", "Santa Marta", LocalDate.of(2000, 1, 1)
        );

        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);

        User savedUser = new User(request.username(), request.email());
        UserProfile profile = new UserProfile(request.firstName(), request.lastName(), request.birthDate());
        savedUser.assignProfile(profile);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse expectedResponse = new UserResponse(
                1L, request.username(), request.email(), request.firstName(), request.lastName(), request.birthDate(), true
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(expectedResponse);

        UserResponse result = userService.register(request);

        assertThat(result).isNotNull();
        assertThat(result.username()).isEqualTo(request.username());
        verify(userRepository).save(any(User.class));
    }

}