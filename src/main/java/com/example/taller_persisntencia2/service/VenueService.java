package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.dto.response.VenueResponse;
import java.util.List;

public interface VenueService {
    VenueResponse findByCode(String code);
    List<VenueResponse> findActiveVenues();
}