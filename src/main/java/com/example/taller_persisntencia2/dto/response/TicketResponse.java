package com.example.taller_persisntencia2.dto.response;

import com.example.taller_persisntencia2.domain.TicketStatus;
import com.example.taller_persisntencia2.domain.TicketType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        String ticketCode,
        TicketType type,
        BigDecimal price,
        TicketStatus status,
        LocalDateTime purchaseDate,
        String userEmail,
        String eventCode,
        String eventName
) {}