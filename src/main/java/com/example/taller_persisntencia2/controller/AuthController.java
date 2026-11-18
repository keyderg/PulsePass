package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.dto.request.LoginRequest;
import com.example.taller_persisntencia2.dto.response.AuthResponse;
import com.example.taller_persisntencia2.dto.response.AuthenticatedUserResponse;
import com.example.taller_persisntencia2.security.SecurityPrincipal;
import com.example.taller_persisntencia2.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityPrincipal principal)) {
            throw new InsufficientAuthenticationException("Autenticación requerida");
        }
        return ResponseEntity.ok(authService.currentUser(principal));
    }
}