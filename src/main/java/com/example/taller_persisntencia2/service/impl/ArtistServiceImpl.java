package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.mapper.ArtistMapper;
import com.example.taller_persisntencia2.repository.ArtistRepository;
import com.example.taller_persisntencia2.service.ArtistService;
import com.example.taller_persisntencia2.dto.response.ArtistResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArtistServiceImpl implements ArtistService {

    private final ArtistRepository artistRepository;
    private final ArtistMapper artistMapper;

    public ArtistServiceImpl(ArtistRepository artistRepository, ArtistMapper artistMapper) {
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public ArtistResponse findById(Long id) {
        return artistRepository.findById(id)
                .map(artistMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public ArtistResponse findByStageName(String stageName) {
        return artistRepository.findByStageName(stageName)
                .map(artistMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado con nombre: " + stageName));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArtistResponse> findActiveArtists() {
        return artistRepository.findByActiveTrueOrderByStageNameAsc()
                .stream()
                .map(artistMapper::toResponse)
                .toList();
    }
}