package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.domain.*;
import com.example.taller_persisntencia2.dto.request.PurchaseTicketRequest;
import com.example.taller_persisntencia2.dto.response.TicketResponse;
import com.example.taller_persisntencia2.exception.BusinessRuleException;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.mapper.TicketMapper;
import com.example.taller_persisntencia2.repository.EventRepository;
import com.example.taller_persisntencia2.repository.TicketRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(TicketRepository ticketRepository, UserRepository userRepository,
                             EventRepository eventRepository, TicketMapper ticketMapper) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketResponse purchase(PurchaseTicketRequest request) {
        // 1. Validar Usuario (BR-TICKET-001 y BR-TICKET-002)
        User user = userRepository.findByEmailIgnoreCase(request.userEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        if (!user.isActive()) {
            throw new BusinessRuleException("El usuario inactivo no puede comprar tickets");
        }

        // 2. Validar Evento (BR-TICKET-003, 004 y 005)
        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException("El evento no está disponible para compras");
        }
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se pueden comprar tickets para un evento pasado");
        }

        // 3. Validar Edad (BR-TICKET-006)
        if (event.getMinimumAge() > 0) {
            int ageAtEvent = Period.between(user.getUserProfile().getBirthDate(), event.getEventDate().toLocalDate()).getYears();
            if (ageAtEvent < event.getMinimumAge()) {
                throw new BusinessRuleException("El usuario no cumple con la edad mínima para el evento");
            }
        }

        // 4. Validar Capacidad (BR-TICKET-007)
        long paidTickets = ticketRepository.countByEventEventCodeAndStatus(event.getEventCode(), TicketStatus.PAID);
        if (paidTickets >= event.getVenue().getCapacity()) {
            throw new BusinessRuleException("El evento ya no tiene capacidad disponible");
        }

        // 5. Calcular Precio (BR-TICKET-009)
        BigDecimal price = calculatePrice(request.type());

        // 6. Crear Ticket
        String generatedCode = UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        Ticket ticket = new Ticket(
                generatedCode,
                request.type(),
                price,
                TicketStatus.PAID,
                LocalDateTime.now(),
                user,
                event
        );
        Ticket savedTicket = ticketRepository.save(ticket);

        // 7. Actualizar a SOLD_OUT si se llenó la capacidad (BR-TICKET-008)
        if (paidTickets + 1 == event.getVenue().getCapacity()) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }

        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse findByCode(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findByUserEmail(String email) {
        return ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findPaidTicketsByEvent(String eventCode) {
        return ticketRepository.findByEventEventCodeAndStatus(eventCode, TicketStatus.PAID)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));

        // BR-TICKET-010, 011 y 012
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Solo se pueden cancelar tickets en estado PAID");
        }
        if (ticket.getEvent().getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se puede cancelar un ticket de un evento que ya ocurrió");
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));

        // BR-TICKET-013 y 014
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Solo los tickets PAID pueden ser marcados como USED");
        }

        ticket.setStatus(TicketStatus.USED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    // Estrategia interna de precios (BR-TICKET-009)
    private BigDecimal calculatePrice(TicketType type) {
        // Aquí podrías adaptar los precios reales según lo que uses en tu enumerador
        if (type == null) return BigDecimal.valueOf(100.00);
        return switch (type.name()) {
            case "VIP" -> BigDecimal.valueOf(250.00);
            case "STUDENT" -> BigDecimal.valueOf(50.00);
            default -> BigDecimal.valueOf(100.00); // GENERAL
        };
    }
}