package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.domain.Artist;
import com.example.taller_persisntencia2.domain.Event;
import com.example.taller_persisntencia2.domain.EventStatus;
import com.example.taller_persisntencia2.domain.Venue;
import com.example.taller_persisntencia2.dto.request.CreateEventRequest;
import com.example.taller_persisntencia2.dto.response.EventResponse;
import com.example.taller_persisntencia2.dto.response.EventSummaryResponse;
import com.example.taller_persisntencia2.exception.BusinessRuleException;
import com.example.taller_persisntencia2.exception.DuplicateResourceException;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.mapper.EventMapper;
import com.example.taller_persisntencia2.repository.ArtistRepository;
import com.example.taller_persisntencia2.repository.EventRepository;
import com.example.taller_persisntencia2.repository.VenueRepository;
import com.example.taller_persisntencia2.service.EventService;
import com.example.taller_persisntencia2.service.AuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;
    private final AuthorizationService authorizationService;

    public EventServiceImpl(EventRepository eventRepository, VenueRepository venueRepository,
                            ArtistRepository artistRepository, EventMapper eventMapper,
                            AuthorizationService authorizationService) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        // BR-EVENT-001: Código único
        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException("El código de evento ya existe");
        }

        // BR-EVENT-004: Fecha válida (futura)
        if (request.eventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("La fecha del evento debe ser en el futuro");
        }

        // BR-EVENT-006: Edad mínima válida
        int minAge = request.minimumAge() != null && request.minimumAge() >= 0 ? request.minimumAge() : 0;

        // BR-EVENT-002: Venue obligatorio
        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() -> new ResourceNotFoundException("Venue no encontrado"));

        // BR-EVENT-003: Venue activo
        if (!venue.isActive()) {
            throw new BusinessRuleException("No se puede crear un evento en un venue inactivo");
        }

        // BR-EVENT-005: Estado inicial DRAFT (se setea en el constructor)
        Event event = new Event(
                request.eventCode(),
                request.name(),
                request.category(),
                EventStatus.DRAFT,
                request.eventDate(),
                venue
        );
        event.setDescription(request.description());
        event.setMinimumAge(minAge);

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse findByCode(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));

        // Un evento no publicado solo lo ven STAFF/ADMIN; para el resto es como si no existiera.
        if (event.getStatus() != EventStatus.PUBLISHED && !authorizationService.canSeeUnpublishedEvents()) {
            throw new ResourceNotFoundException("Evento no encontrado");
        }
        return eventMapper.toResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findPublishedEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public EventResponse publish(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));

        // BR-EVENT-007: Solo en estado DRAFT
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException("Solo se pueden publicar eventos en estado DRAFT");
        }

        // BR-EVENT-008: Fecha futura
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("La fecha del evento ya pasó, no se puede publicar");
        }

        // BR-EVENT-009: Venue activo
        if (!event.getVenue().isActive()) {
            throw new BusinessRuleException("El venue está inactivo, no se puede publicar");
        }

        event.setStatus(EventStatus.PUBLISHED);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional
    public EventResponse addArtist(String eventCode, Long artistId) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));

        // BR-EVENT-011: No en eventos cancelados o finalizados
        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.FINISHED) {
            throw new BusinessRuleException("No se pueden agregar artistas a eventos cancelados o finalizados");
        }

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado"));

        // BR-EVENT-010: Evitar duplicados
        if (event.getArtists().contains(artist)) {
            throw new BusinessRuleException("El artista ya está asociado a este evento");
        }

        event.addArtist(artist);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findByArtist(String stageName) {
        boolean canSeeUnpublished = authorizationService.canSeeUnpublishedEvents();
        return eventRepository.findByArtistsStageNameIgnoreCase(stageName)
                .stream()
                .filter(event -> canSeeUnpublished || event.getStatus() == EventStatus.PUBLISHED)
                .map(eventMapper::toSummary)
                .toList();
    }
}