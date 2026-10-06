package com.example.taller_persisntencia2.dto.response;

public record ArtistResponse(
        Long id,
        String stageName,
        String country,
        String genre,
        boolean active
) {}