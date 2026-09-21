package com.example.taller_persisntencia2;

import com.example.taller_persisntencia2.domain.*;
import com.example.taller_persisntencia2.repository.EventRepository;
import com.example.taller_persisntencia2.repository.TicketRepository;
import com.example.taller_persisntencia2.repository.UserRepository;
import com.example.taller_persisntencia2.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class TicketRepositoryIT {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Test
    void shouldSaveAndCountPaidTickets() {

        Venue venue = new Venue("VEN-TKT-01", "Theater Hall", "Bogotá", "Carrera 7", 2000);
        venueRepository.save(venue);


        Event event = new Event(
                "EVT-TKT-01",
                "Rock Fest",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(15),
                venue
        );
        eventRepository.save(event);


        User user = new User("carlos_tkt", "carlos@tkt.com");
        user.setActive(true);
        userRepository.save(user);


        Ticket ticket = new Ticket(
                "TCK-9999",
                TicketType.VIP,
                new BigDecimal("250000.00"),
                TicketStatus.PAID,
                LocalDateTime.now(),
                user,
                event
        );
        ticketRepository.save(ticket);


        long paidCount = ticketRepository.countTicketsByEventCodeAndStatus("EVT-TKT-01", TicketStatus.PAID);

        assertThat(paidCount).isEqualTo(1);
    }
}