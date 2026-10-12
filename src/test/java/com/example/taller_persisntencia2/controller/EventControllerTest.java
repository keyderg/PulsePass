package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.domain.EventCategory;
import com.example.taller_persisntencia2.domain.EventStatus;
import com.example.taller_persisntencia2.dto.request.CreateEventRequest;
import com.example.taller_persisntencia2.dto.response.ArtistResponse;
import com.example.taller_persisntencia2.dto.response.EventResponse;
import com.example.taller_persisntencia2.dto.response.EventSummaryResponse;
import com.example.taller_persisntencia2.exception.BusinessRuleException;
import com.example.taller_persisntencia2.exception.DuplicateResourceException;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.service.EventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    private static final LocalDateTime EVENT_DATE = LocalDateTime.of(2026, 12, 15, 20, 0);

    private static final String VALID_JSON = """
            {
              "eventCode": "CMF-2026",
              "name": "Caribbean Music Fest 2026",
              "description": "Festival de musica",
              "category": "MUSIC",
              "eventDate": "2026-12-15T20:00:00",
              "minimumAge": 18,
              "venueCode": "VEN-SMR-01"
            }
            """;

    private CreateEventRequest validRequest() {
        return new CreateEventRequest("CMF-2026", "Caribbean Music Fest 2026", "Festival de musica",
                EventCategory.MUSIC, EVENT_DATE, 18, "VEN-SMR-01");
    }

    private ArtistResponse solarBeat() {
        return new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);
    }

    private EventResponse event(EventStatus status, Set<ArtistResponse> artists) {
        return new EventResponse(1L, "CMF-2026", "Caribbean Music Fest 2026", "Festival de musica",
                EventCategory.MUSIC, status, EVENT_DATE, 18, "VEN-SMR-01",
                "Marina Convention Center", artists);
    }

    private EventSummaryResponse summary() {
        return new EventSummaryResponse("CMF-2026", "Caribbean Music Fest 2026",
                EventStatus.PUBLISHED, EVENT_DATE, "Marina Convention Center");
    }

    // TEST-CTRL-EVT-001
    @Test
    void create_validRequest_returns201() throws Exception {
        when(eventService.create(validRequest())).thenReturn(event(EventStatus.DRAFT, Set.of()));

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.category").value("MUSIC"))
                .andExpect(jsonPath("$.venueCode").value("VEN-SMR-01"));

        verify(eventService).create(validRequest());
    }

    // TEST-CTRL-EVT-002
    @Test
    void create_invalidRequest_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventCode": "",
                                  "name": "Caribbean Music Fest 2026",
                                  "category": "MUSIC",
                                  "eventDate": "2026-12-15T20:00:00",
                                  "minimumAge": 18
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.eventCode").value("Event code is required"))
                .andExpect(jsonPath("$.details.venueCode").value("Venue code is required"));

        verify(eventService, never()).create(any());
    }

    // Extra: edad mínima negativa
    @Test
    void create_negativeMinimumAge_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON.replace("\"minimumAge\": 18", "\"minimumAge\": -1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.minimumAge").value("Minimum age must be 0 or greater"));

        verify(eventService, never()).create(any());
    }

    // Extra: categoría que no existe en el enum
    @Test
    void create_unknownCategory_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON.replace("\"MUSIC\"", "\"NOT_A_CATEGORY\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed JSON request"));

        verify(eventService, never()).create(any());
    }

    // Extra: código de evento duplicado -> 409
    @Test
    void create_duplicateEventCode_returns409() throws Exception {
        when(eventService.create(validRequest()))
                .thenThrow(new DuplicateResourceException("Event code already exists: CMF-2026"));

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Event code already exists: CMF-2026"));

        verify(eventService).create(validRequest());
    }

    // TEST-CTRL-EVT-003
    @Test
    void findByCode_existingEvent_returns200() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(event(EventStatus.DRAFT, Set.of(solarBeat())));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.name").value("Caribbean Music Fest 2026"))
                .andExpect(jsonPath("$.venueName").value("Marina Convention Center"))
                .andExpect(jsonPath("$.eventDate").value("2026-12-15T20:00:00"))
                .andExpect(jsonPath("$.artists.length()").value(1))
                .andExpect(jsonPath("$.artists[0].stageName").value("Solar Beat"));

        verify(eventService).findByCode("CMF-2026");
    }

    // TEST-CTRL-EVT-004
    @Test
    void findByCode_unknownEvent_returns404() throws Exception {
        when(eventService.findByCode("XXX"))
                .thenThrow(new ResourceNotFoundException("Event not found: XXX"));

        mockMvc.perform(get("/api/events/XXX"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Event not found: XXX"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(eventService).findByCode("XXX");
    }

    // TEST-CTRL-EVT-005
    @Test
    void findPublishedEvents_returns200() throws Exception {
        when(eventService.findPublishedEvents()).thenReturn(List.of(summary()));

        mockMvc.perform(get("/api/events/published"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$[0].status").value("PUBLISHED"))
                .andExpect(jsonPath("$[0].venueName").value("Marina Convention Center"));

        verify(eventService).findPublishedEvents();
    }

    // TEST-CTRL-EVT-006
    @Test
    void publish_validTransition_returns200() throws Exception {
        when(eventService.publish("CMF-2026")).thenReturn(event(EventStatus.PUBLISHED, Set.of()));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("CMF-2026");
    }

    // TEST-CTRL-EVT-007
    @Test
    void publish_businessRuleViolation_returns409() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenThrow(new BusinessRuleException("Event cannot be published: CMF-2026"));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Event cannot be published: CMF-2026"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(eventService).publish("CMF-2026");
    }

    // Extra: publicar un evento inexistente
    @Test
    void publish_unknownEvent_returns404() throws Exception {
        when(eventService.publish("XXX"))
                .thenThrow(new ResourceNotFoundException("Event not found: XXX"));

        mockMvc.perform(patch("/api/events/XXX/publish"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Event not found: XXX"));

        verify(eventService).publish("XXX");
    }

    // TEST-CTRL-EVT-008
    @Test
    void addArtist_validAssociation_returns200() throws Exception {
        when(eventService.addArtist("CMF-2026", 1L))
                .thenReturn(event(EventStatus.DRAFT, Set.of(solarBeat())));

        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.artists.length()").value(1))
                .andExpect(jsonPath("$.artists[0].id").value(1))
                .andExpect(jsonPath("$.artists[0].stageName").value("Solar Beat"));

        verify(eventService).addArtist("CMF-2026", 1L);
    }

    // Extra: artista ya asociado -> 409
    @Test
    void addArtist_alreadyAssociated_returns409() throws Exception {
        when(eventService.addArtist("CMF-2026", 1L))
                .thenThrow(new BusinessRuleException("Artist already associated to event: CMF-2026"));

        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Artist already associated to event: CMF-2026"));

        verify(eventService).addArtist("CMF-2026", 1L);
    }

    // Extra: artista inexistente -> 404
    @Test
    void addArtist_unknownArtist_returns404() throws Exception {
        when(eventService.addArtist("CMF-2026", 99L))
                .thenThrow(new ResourceNotFoundException("Artist not found: 99"));

        mockMvc.perform(post("/api/events/CMF-2026/artists/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Artist not found: 99"));

        verify(eventService).addArtist("CMF-2026", 99L);
    }

    // Extra: artistId no numérico -> 400
    @Test
    void addArtist_nonNumericArtistId_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/events/CMF-2026/artists/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.artistId").value("Invalid value"));

        verify(eventService, never()).addArtist(anyString(), anyLong());
    }

    // TEST-CTRL-EVT-009
    @Test
    void findByArtist_returns200() throws Exception {
        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of(summary()));

        mockMvc.perform(get("/api/events/by-artist").param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"));

        verify(eventService).findByArtist("Solar Beat");
    }

    // Extra: falta stageName -> 400
    @Test
    void findByArtist_missingParam_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(get("/api/events/by-artist"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.stageName").value("Parameter is required"));

        verify(eventService, never()).findByArtist(anyString());
    }
}