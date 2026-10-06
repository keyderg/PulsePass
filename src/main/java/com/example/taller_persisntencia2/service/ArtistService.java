package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.dto.response.ArtistResponse;
import java.util.List;

public interface ArtistService {
    ArtistResponse findById(Long id);
    ArtistResponse findByStageName(String stageName);
    List<ArtistResponse> findActiveArtists();
}