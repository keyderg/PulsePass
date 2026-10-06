package com.example.taller_persisntencia2.dto.request;

import com.example.taller_persisntencia2.domain.TicketType;

public record PurchaseTicketRequest(
        String userEmail,
        String eventCode,
        TicketType type
) {}