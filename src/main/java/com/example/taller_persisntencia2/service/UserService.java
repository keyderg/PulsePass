package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.dto.request.RegisterUserRequest;
import com.example.taller_persisntencia2.dto.response.UserResponse;
import org.springframework.security.access.prepost.PreAuthorize;

public interface UserService {

    UserResponse register(RegisterUserRequest request);

    @PreAuthorize("hasRole('ADMIN') or @authorizationService.isPrincipalEmail(#email)")
    UserResponse findByEmail(String email);

    @PreAuthorize("hasRole('ADMIN') or @authorizationService.isPrincipalUsername(#username)")
    UserResponse findByUsername(String username);
}