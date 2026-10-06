package com.example.taller_persisntencia2.mapper;

import com.example.taller_persisntencia2.domain.Event;
import com.example.taller_persisntencia2.dto.response.EventResponse;
import com.example.taller_persisntencia2.dto.response.EventSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ArtistMapper.class})
public interface EventMapper {
    @Mapping(target = "venueCode", source = "venue.code")
    @Mapping(target = "venueName", source = "venue.name")
    EventResponse toResponse(Event event);

    @Mapping(target = "venueName", source = "venue.name")
    EventSummaryResponse toSummary(Event event);
}
