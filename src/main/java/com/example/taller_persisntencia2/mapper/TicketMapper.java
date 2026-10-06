package com.example.taller_persisntencia2.mapper;

import com.example.taller_persisntencia2.domain.Ticket;
import com.example.taller_persisntencia2.dto.response.TicketResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TicketMapper {
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "eventCode", source = "event.eventCode")
    @Mapping(target = "eventName", source = "event.name")
    TicketResponse toResponse(Ticket ticket);
}