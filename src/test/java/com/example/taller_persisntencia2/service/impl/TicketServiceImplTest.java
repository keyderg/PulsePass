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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketServiceImpl ticketService;

    @Test
    void testTicket001_PurchaseWithNonExistingUserThrowsResourceNotFoundException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("unknown@example.com", "EV-01", TicketType.GENERAL);
        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Usuario no encontrado");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket002_PurchaseWithInactiveUserThrowsBusinessRuleException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("inactive@example.com", "EV-01", TicketType.GENERAL);
        User inactiveUser = new User("inactive", "inactive@example.com");
        inactiveUser.setActive(false);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(inactiveUser));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("El usuario inactivo no puede comprar tickets");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket003_PurchaseWithNonExistingEventThrowsResourceNotFoundException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("adult@example.com", "UNKNOWN-EV", TicketType.GENERAL);
        User adultUser = new User("adult", "adult@example.com");
        UserProfile profile = new UserProfile("Adult", "User", LocalDate.now().minusYears(25));
        adultUser.assignProfile(profile);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(adultUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Evento no encontrado");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket004_PurchaseWithDraftEventThrowsBusinessRuleException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("adult@example.com", "EV-01", TicketType.GENERAL);
        User adultUser = new User("adult", "adult@example.com");
        UserProfile profile = new UserProfile("Adult", "User", LocalDate.now().minusYears(25));
        adultUser.assignProfile(profile);

        Venue venue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 100);
        Event draftEvent = new Event("EV-01", "Concert", EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusMonths(2), venue);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(adultUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(draftEvent));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("El evento no está disponible para compras");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket005_PurchaseWithCancelledEventThrowsBusinessRuleException() {
        PurchaseTicketRequest request = new PurchaseTicketRequest("adult@example.com", "EV-01", TicketType.GENERAL);
        User adultUser = new User("adult", "adult@example.com");
        UserProfile profile = new UserProfile("Adult", "User", LocalDate.now().minusYears(25));
        adultUser.assignProfile(profile);

        Venue venue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 100);
        Event cancelledEvent = new Event("EV-01", "Concert", EventCategory.MUSIC, EventStatus.CANCELLED, LocalDateTime.now().plusMonths(2), venue);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(adultUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(cancelledEvent));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("El evento no está disponible para compras");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }


    @Test
    void testTicket006_PurchaseWithUnderageUserThrowsBusinessRuleException() {
        // ARRANGE
        PurchaseTicketRequest request = new PurchaseTicketRequest("young@example.com", "EV-01", TicketType.GENERAL);

        // Usuario menor de edad (nacido hace 15 años)
        User youngUser = new User("young_user", "young@example.com");
        UserProfile profile = new UserProfile("Young", "User", LocalDate.now().minusYears(15));
        youngUser.assignProfile(profile);

        // Evento que exige mínimo 18 años para el próximo año
        Venue venue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 500);
        Event event = new Event("EV-01", "Concert", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusMonths(2), venue);
        event.setMinimumAge(18);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(youngUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(event));

        // ACT & ASSERT
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("El usuario no cumple con la edad mínima para el evento");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket007_PurchaseWhenCapacityIsFullThrowsBusinessRuleException() {
        // ARRANGE
        PurchaseTicketRequest request = new PurchaseTicketRequest("adult@example.com", "EV-01", TicketType.GENERAL);

        User adultUser = new User("adult_user", "adult@example.com");
        UserProfile profile = new UserProfile("Adult", "User", LocalDate.now().minusYears(25));
        adultUser.assignProfile(profile);

        // Venue con capacidad de 100
        Venue venue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 100);
        Event event = new Event("EV-01", "Concert", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusMonths(2), venue);
        event.setMinimumAge(18);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(adultUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(event));

        // Ya hay 100 tickets vendidos (capacidad al 100%)
        when(ticketRepository.countByEventEventCodeAndStatus("EV-01", TicketStatus.PAID)).thenReturn(100L);

        // ACT & ASSERT
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("El evento ya no tiene capacidad disponible");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket008_PurchaseThatFillsCapacityUpdatesEventStatusToSoldOut() {
        // ARRANGE
        PurchaseTicketRequest request = new PurchaseTicketRequest("adult@example.com", "EV-01", TicketType.GENERAL);

        User adultUser = new User("adult_user", "adult@example.com");
        UserProfile profile = new UserProfile("Adult", "User", LocalDate.now().minusYears(25));
        adultUser.assignProfile(profile);

        // Venue con capacidad de 1
        Venue venue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 1);
        Event event = new Event("EV-01", "Concert", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusMonths(2), venue);
        event.setMinimumAge(0);

        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(adultUser));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(event));

        // Actualmente hay 0 tickets vendidos, con este se llenará (0 + 1 == 1)
        when(ticketRepository.countByEventEventCodeAndStatus("EV-01", TicketStatus.PAID)).thenReturn(0L);

        Ticket savedTicket = new Ticket("TICK-123", TicketType.GENERAL, BigDecimal.valueOf(100.0), TicketStatus.PAID, LocalDateTime.now(), adultUser, event);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(savedTicket);

        TicketResponse expectedResponse = new TicketResponse(1L, "TICK-123", TicketType.GENERAL, BigDecimal.valueOf(100.0), TicketStatus.PAID, LocalDateTime.now(), adultUser.getEmail(), event.getEventCode(), event.getName());
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(expectedResponse);

        // ACT
        TicketResponse result = ticketService.purchase(request);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(event.getStatus()).isEqualTo(EventStatus.SOLD_OUT); // Valida la regla BR-TICKET-008
        verify(eventRepository).save(event);
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    void testTicket009_CancelExistingPaidTicketSuccessfullyChangesStatusToCancelled() {
        // ARRANGE
        String ticketCode = "TICK-123";
        User user = new User("user", "user@example.com");
        Venue venue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 100);
        Event event = new Event("EV-01", "Concert", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusMonths(2), venue);

        Ticket mockTicket = new Ticket(ticketCode, TicketType.GENERAL, BigDecimal.valueOf(100.0), TicketStatus.PAID, LocalDateTime.now(), user, event);

        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.of(mockTicket));

        // ACT
        ticketService.cancel(ticketCode);

        // ASSERT
        assertThat(mockTicket.getStatus()).isEqualTo(TicketStatus.CANCELLED);
        verify(ticketRepository).save(mockTicket);
    }

    @Test
    void testTicket010_CancelNonExistingTicketThrowsResourceNotFoundException() {
        // ARRANGE
        String ticketCode = "UNKNOWN";
        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() -> ticketService.cancel(ticketCode))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Ticket no encontrado");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket011_CancelAlreadyCancelledTicketThrowsBusinessRuleException() {
        // ARRANGE
        String ticketCode = "TICK-123";
        User user = new User("user", "user@example.com");
        Venue venue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 100);
        Event event = new Event("EV-01", "Concert", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusMonths(2), venue);

        Ticket mockTicket = new Ticket(ticketCode, TicketType.GENERAL, BigDecimal.valueOf(100.0), TicketStatus.CANCELLED, LocalDateTime.now(), user, event);

        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.of(mockTicket));

        // ACT & ASSERT
        assertThatThrownBy(() -> ticketService.cancel(ticketCode))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Solo se pueden cancelar tickets en estado PAID");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testTicket012_FindByEmailIgnoreCaseReturnsListOfTickets() {
        // ARRANGE
        String email = "USER@EXAMPLE.COM";
        when(ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email)).thenReturn(List.of());

        // ACT
        var result = ticketService.findByUserEmail(email);

        // ASSERT
        assertThat(result).isNotNull();
        verify(ticketRepository).findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email);
    }

}