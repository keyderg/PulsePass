package com.example.taller_persisntencia2.dto.response;

public record VenueResponse(
        Long id,
        String code,
        String name,
        String city,
        String address,
        Integer capacity,
        boolean active
) {}