package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.*;
import com.example.taller_persisntencia2.repository.ArtistRepository;
import com.example.taller_persisntencia2.repository.EventRepository;
import com.example.taller_persisntencia2.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class EventArtistIT {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Test
    void shouldAssociateMultipleArtistsToEventWithoutDuplicates() {
        // 1. Crear y guardar un Venue
        Venue venue = new Venue("VEN-ART-01", "Open Air Stage", "Santa Marta", "Av. Del Mar", 4000);
        venueRepository.save(venue);

        // 2. Crear y guardar varios artistas únicos para la prueba
        Artist artist1 = new Artist("Neon Waves Unique", "Colombia", "Electronic");
        artist1.setActive(true);
        artistRepository.save(artist1);

        Artist artist2 = new Artist("Caribbean Sound Unique", "Colombia", "Folkloric");
        artist2.setActive(true);
        artistRepository.save(artist2);

        // 3. Crear el evento y usar el método helper addArtist para asociarlos de forma segura
        Event event = new Event(
                "EVT-ART-01",
                "Festival Costeño",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(20),
                venue
        );

        event.addArtist(artist1);
        event.addArtist(artist2);

        // Intentar agregar un artista duplicado intencionalmente para validar la relación N:M
        event.addArtist(artist1);

        eventRepository.save(event);

        // 4. Consultar y verificar el resultado
        Event foundEvent = eventRepository.findByEventCode("EVT-ART-01").orElse(null);

        assertThat(foundEvent).isNotNull();
        // El Set de artistas debe manejar la unicidad y tener exactamente 2 artistas (evitando duplicados)
        assertThat(foundEvent.getArtists()).hasSize(2);
    }
}