package com.example.taller_persisntencia2.dto.response;

import java.time.LocalDate;

public record UserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        LocalDate birthDate,
        boolean active
) {}