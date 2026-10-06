package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.domain.Event;
import com.example.taller_persisntencia2.domain.EventCategory;
import com.example.taller_persisntencia2.domain.EventStatus;
import com.example.taller_persisntencia2.domain.Venue;
import com.example.taller_persisntencia2.dto.request.CreateEventRequest;
import com.example.taller_persisntencia2.dto.response.EventResponse;
import com.example.taller_persisntencia2.exception.BusinessRuleException;
import com.example.taller_persisntencia2.exception.DuplicateResourceException;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.mapper.EventMapper;
import com.example.taller_persisntencia2.repository.ArtistRepository;
import com.example.taller_persisntencia2.repository.EventRepository;
import com.example.taller_persisntencia2.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// NFR-001: Pruebas sin Spring ApplicationContext ni PostgreSQL[cite: 25, 27, 32]
@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private VenueRepository venueRepository;
    @Mock
    private ArtistRepository artistRepository;
    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @Test
    void testEvent001_ExistingEventReturnsDTO() { // TEST-EVENT-001[cite: 27]
        // ARRANGE
        String code = "CMF-2026";


        Event mockEvent = new Event(code, "Fest", EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(10), new Venue("VEN-01", "Estadio Central", "Santa Marta", "Calle 10 # 5-20", 1000));
        EventResponse expectedResponse = new EventResponse(1L, code, "Fest", "Desc", EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(10), 18, "VEN-01", "Arena", Set.of());

        when(eventRepository.findByEventCode(code)).thenReturn(Optional.of(mockEvent));
        when(eventMapper.toResponse(mockEvent)).thenReturn(expectedResponse);

        // ACT
        EventResponse result = eventService.findByCode(code);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.eventCode()).isEqualTo(code);
        verify(eventRepository).findByEventCode(code);
    }

    @Test
    void testEvent002_NonExistingEventThrowsResourceNotFoundException() {
        String code = "UNKNOWN";
        when(eventRepository.findByEventCode(code)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.findByCode(code))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Evento no encontrado");
    }

    @Test
    void testEvent003_CreateEventWithExistingCodeThrowsDuplicateResourceException() {
        CreateEventRequest request = new CreateEventRequest("EV-01", "Name", "Desc", EventCategory.MUSIC, LocalDateTime.now().plusDays(5), 18, "VEN-01");
        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(true);

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("El código de evento ya existe");

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void testEvent004_CreateEventWithNonExistingVenueThrowsExceptionAndNeverSaves() { // TEST-EVENT-004[cite: 27]
        // ARRANGE
        CreateEventRequest request = new CreateEventRequest("EV-01", "Name", "Desc", EventCategory.MUSIC, LocalDateTime.now().plusDays(5), 18, "INVALID-VENUE");

        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(false);
        when(venueRepository.findByCode(request.venueCode())).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Venue no encontrado");

        // ASSERT (verificación estricta de que el guardado nunca ocurrió)
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void testEvent005_CreateEventWithPastDateThrowsBusinessRuleException() {
        CreateEventRequest request = new CreateEventRequest("EV-01", "Name", "Desc", EventCategory.MUSIC, LocalDateTime.now().minusDays(1), 18, "VEN-01");
        when(eventRepository.existsByEventCode(request.eventCode())).thenReturn(false);

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("La fecha del evento debe ser en el futuro");

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void testEvent006_PublishDraftEventSuccessfullyChangesStatus() {
        String code = "EV-01";
        Venue validVenue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 1000);
        Event mockEvent = new Event(code, "Fest", EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(10), validVenue);

        when(eventRepository.findByEventCode(code)).thenReturn(Optional.of(mockEvent));

        eventService.publish(code);

        assertThat(mockEvent.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        verify(eventRepository).save(mockEvent);
    }

    @Test
    void testEvent007_PublishAlreadyPublishedEventThrowsBusinessRuleException() {
        String code = "EV-01";
        Venue validVenue = new Venue("VEN-01", "Arena", "Ciudad", "Dir", 1000);
        Event mockEvent = new Event(code, "Fest", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusDays(10), validVenue);

        when(eventRepository.findByEventCode(code)).thenReturn(Optional.of(mockEvent));

        assertThatThrownBy(() -> eventService.publish(code))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Solo se pueden publicar eventos en estado DRAFT");

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void testEvent008_PublishCancelledEventThrowsBusinessRuleExceptionAndNeverSaves() { // TEST-EVENT-008[cite: 27]
        // ARRANGE
        String code = "CANCELLED-EV";
        Event mockEvent = new Event(code, "Fest", EventCategory.MUSIC, EventStatus.CANCELLED, LocalDateTime.now().plusDays(10), new Venue("VEN-01", "Estadio Central", "Santa Marta", "Calle 10 # 5-20", 1000));

        when(eventRepository.findByEventCode(code)).thenReturn(Optional.of(mockEvent));

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.publish(code))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Solo se pueden publicar eventos en estado DRAFT");

        // ASSERT
        verify(eventRepository, never()).save(any(Event.class));
    }
}