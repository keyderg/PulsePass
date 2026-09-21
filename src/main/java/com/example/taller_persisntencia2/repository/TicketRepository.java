package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.Ticket;
import com.example.taller_persisntencia2.domain.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserEmailAndStatus(String email, TicketStatus status);

    List<Ticket> findByEventEventCodeAndStatus(String eventCode, TicketStatus status);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.event.eventCode = :eventCode AND t.status = :status")
    long countTicketsByEventCodeAndStatus(@Param("eventCode") String eventCode, @Param("status") TicketStatus status);
}