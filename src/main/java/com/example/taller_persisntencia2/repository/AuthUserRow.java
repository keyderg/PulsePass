package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.Role;

public record AuthUserRow(
        Long id,
        String username,
        Boolean active,
        String passwordHash,
        Role role
) {}