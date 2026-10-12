package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.dto.response.ArtistResponse;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.service.ArtistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArtistController.class)
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArtistService artistService;

    private ArtistResponse solarBeat() {
        return new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);
    }

    // TEST-CTRL-ART-001
    @Test
    void findById_existingArtist_returns200() throws Exception {
        when(artistService.findById(1L)).thenReturn(solarBeat());

        mockMvc.perform(get("/api/artists/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"))
                .andExpect(jsonPath("$.country").value("Colombia"))
                .andExpect(jsonPath("$.genre").value("Electronic"))
                .andExpect(jsonPath("$.active").value(true));

        verify(artistService).findById(1L);
    }

    // TEST-CTRL-ART-002
    @Test
    void findById_unknownArtist_returns404() throws Exception {
        when(artistService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Artist not found: 99"));

        mockMvc.perform(get("/api/artists/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Artist not found: 99"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(artistService).findById(99L);
    }

    // Extra: id no numérico -> 400, no 500
    @Test
    void findById_nonNumericId_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(get("/api/artists/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.id").value("Invalid value"));

        verify(artistService, never()).findById(org.mockito.ArgumentMatchers.anyLong());
    }

    // TEST-CTRL-ART-003
    @Test
    void findByStageName_existingArtist_returns200() throws Exception {
        when(artistService.findByStageName("Solar Beat")).thenReturn(solarBeat());

        mockMvc.perform(get("/api/artists/by-stage-name").param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"))
                .andExpect(jsonPath("$.genre").value("Electronic"));

        verify(artistService).findByStageName("Solar Beat");
    }

    // Extra: FR-CTRLART-002 pide 200 o 404
    @Test
    void findByStageName_unknownArtist_returns404() throws Exception {
        when(artistService.findByStageName("Nobody"))
                .thenThrow(new ResourceNotFoundException("Artist not found: Nobody"));

        mockMvc.perform(get("/api/artists/by-stage-name").param("stageName", "Nobody"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Artist not found: Nobody"));

        verify(artistService).findByStageName("Nobody");
    }

    // Extra: falta el parámetro -> 400
    @Test
    void findByStageName_missingParam_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(get("/api/artists/by-stage-name"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.stageName").value("Parameter is required"));

        verify(artistService, never()).findByStageName(org.mockito.ArgumentMatchers.anyString());
    }

    // TEST-CTRL-ART-004
    @Test
    void findActiveArtists_returns200() throws Exception {
        when(artistService.findActiveArtists()).thenReturn(List.of(
                solarBeat(),
                new ArtistResponse(2L, "Neon Waves", "Colombia", "Pop", true)));

        mockMvc.perform(get("/api/artists/active"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].stageName").value("Solar Beat"))
                .andExpect(jsonPath("$[1].stageName").value("Neon Waves"));

        verify(artistService).findActiveArtists();
    }
}