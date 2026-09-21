package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.Venue;
import com.example.taller_persisntencia2.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class VenuePersistenceTest {

    @Autowired
    private VenueRepository venueRepository;

    @Test
    void shouldSaveAndFindVenue() {
        Venue venue = new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 10", 5000);
        venueRepository.save(venue);

        Venue found = venueRepository.findByCode("VEN-SMR-01").orElse(null);

        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo("Marina Convention Center");
        assertThat(found.getCapacity()).isGreaterThan(0);
    }
}