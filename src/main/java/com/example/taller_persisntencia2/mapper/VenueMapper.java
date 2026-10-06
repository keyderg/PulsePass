package com.example.taller_persisntencia2.mapper;

import com.example.taller_persisntencia2.domain.Venue;
import com.example.taller_persisntencia2.dto.response.VenueResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    VenueResponse toResponse(Venue venue);
}