package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.Event;
import com.example.taller_persisntencia2.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByEventCode(String eventCode);

    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    List<Event> findByVenueCode(String venueCode);

    @Query("SELECT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findEventsByArtist(@Param("stageName") String stageName);

    @Query("SELECT e FROM Event e JOIN e.venue v JOIN e.artists a WHERE v.city = :city AND a.stageName = :stageName")
    List<Event> findEventsByCityAndArtist(@Param("city") String city, @Param("stageName") String stageName);

    @Query("SELECT DISTINCT e FROM Event e JOIN e.venue v JOIN e.artists a " +
            "WHERE e.status = :status AND e.eventDate > :date AND v.city = :city " +
            "AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistKeyword, '%')) " +
            "ORDER BY e.eventDate ASC")
    List<Event> findRecommendedEvents(
            @Param("status") EventStatus status,
            @Param("date") LocalDateTime date,
            @Param("city") String city,
            @Param("artistKeyword") String artistKeyword
    );
}
