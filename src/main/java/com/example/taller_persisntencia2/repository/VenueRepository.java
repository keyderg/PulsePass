package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    Optional<Venue> findByCode(String code);
}