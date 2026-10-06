package com.example.taller_persisntencia2.service.impl;

import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.mapper.VenueMapper;
import com.example.taller_persisntencia2.repository.VenueRepository;
import com.example.taller_persisntencia2.service.VenueService;
import com.example.taller_persisntencia2.dto.response.VenueResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    //(SRV-002)
    public VenueServiceImpl(VenueRepository venueRepository, VenueMapper venueMapper) {
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse findByCode(String code) {
        return venueRepository.findByCode(code)
                .map(venueMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Venue no encontrado con código: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> findActiveVenues() {
        return venueRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(venueMapper::toResponse)
                .toList();
    }
}