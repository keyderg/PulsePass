package com.example.taller_persisntencia2.dto.response;

import com.example.taller_persisntencia2.domain.EventStatus;
import java.time.LocalDateTime;

public record EventSummaryResponse(
        String eventCode,
        String name,
        EventStatus status,
        LocalDateTime eventDate,
        String venueName
) {}