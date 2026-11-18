package com.example.taller_persisntencia2.dto.response;

import java.util.List;

public record AuthenticatedUserResponse(
        Long id,
        String username,
        List<String> roles
) {}