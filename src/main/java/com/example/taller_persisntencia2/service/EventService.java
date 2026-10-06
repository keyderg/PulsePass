package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.dto.request.CreateEventRequest;
import com.example.taller_persisntencia2.dto.response.EventResponse;
import com.example.taller_persisntencia2.dto.response.EventSummaryResponse;
import java.util.List;

public interface EventService {
    EventResponse create(CreateEventRequest request);
    EventResponse findByCode(String eventCode);
    List<EventSummaryResponse> findPublishedEvents();
    EventResponse publish(String eventCode);
    EventResponse addArtist(String eventCode, Long artistId);
    List<EventSummaryResponse> findByArtist(String stageName);
}