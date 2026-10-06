package com.example.taller_persisntencia2.dto.request;

import com.example.taller_persisntencia2.domain.EventCategory;
import java.time.LocalDateTime;

public record CreateEventRequest(
        String eventCode,
        String name,
        String description,
        EventCategory category,
        LocalDateTime eventDate,
        Integer minimumAge,
        String venueCode
) {}