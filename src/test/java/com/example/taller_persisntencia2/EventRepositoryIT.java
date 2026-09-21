package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.*;
import com.example.taller_persisntencia2.repository.ArtistRepository;
import com.example.taller_persisntencia2.repository.EventRepository;
import com.example.taller_persisntencia2.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class EventRepositoryIT {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Test
    void shouldFindPublishedEventsOrderedByDate() {
        // 1. Crear y guardar un Venue
        Venue venue = new Venue("VEN-EVT-01", "Arena Central", "Medellín", "Calle 50", 10000);
        venueRepository.save(venue);

        // 2. Crear y guardar un Evento Publicado
        Event event = new Event(
                "EVT-001",
                "Concierto Rock",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(5),
                venue
        );
        eventRepository.save(event);

        // 3. Probar Query Method
        List<Event> publishedEvents = eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED);

        assertThat(publishedEvents).isNotEmpty();
        assertThat(publishedEvents.get(0).getEventCode()).isEqualTo("EVT-001");
    }

    @Test
    void shouldFindEventsByArtist() {
        // 1. Venue y Artista (usando un nombre único que no colisione con Flyway V2)
        Venue venue = new Venue("VEN-EVT-02", "Plaza Mayor", "Medellín", "Calle 40", 8000);
        venueRepository.save(venue);

        Artist artist = new Artist("Rock Star Unique", "Colombia", "Rock");
        artist.setActive(true);
        artistRepository.save(artist);

        // 2. Evento asociado al Artista
        Event event = new Event(
                "EVT-002",
                "Festival de Verano",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                venue
        );
        event.getArtists().add(artist);
        eventRepository.save(event);

        // 3. Probar consulta JPQL con JOIN
        List<Event> eventsByArtist = eventRepository.findEventsByArtist("Rock Star Unique");

        assertThat(eventsByArtist).isNotEmpty();
        assertThat(eventsByArtist.get(0).getName()).isEqualTo("Festival de Verano");
    }
}