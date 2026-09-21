package com.example.taller_persisntencia2.repository;

import com.example.taller_persisntencia2.domain.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Optional<Artist> findByStageName(String stageName);
}