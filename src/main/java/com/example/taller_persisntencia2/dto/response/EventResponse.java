package com.example.taller_persisntencia2.dto.response;

import com.example.taller_persisntencia2.domain.EventCategory;
import com.example.taller_persisntencia2.domain.EventStatus;
import java.time.LocalDateTime;
import java.util.Set;

public record EventResponse(
        Long id,
        String eventCode,
        String name,
        String description,
        EventCategory category,
        EventStatus status,
        LocalDateTime eventDate,
        Integer minimumAge,
        String venueCode,
        String venueName,
        Set<ArtistResponse> artists
) {}