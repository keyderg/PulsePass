package com.example.taller_persisntencia2.mapper;

import com.example.taller_persisntencia2.domain.Artist;
import com.example.taller_persisntencia2.dto.response.ArtistResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ArtistMapper {
    ArtistResponse toResponse(Artist artist);
}