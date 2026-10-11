package com.example.taller_persisntencia2.controller;

import com.example.taller_persisntencia2.domain.TicketStatus;
import com.example.taller_persisntencia2.domain.TicketType;
import com.example.taller_persisntencia2.dto.request.PurchaseTicketRequest;
import com.example.taller_persisntencia2.dto.response.TicketResponse;
import com.example.taller_persisntencia2.exception.BusinessRuleException;
import com.example.taller_persisntencia2.exception.ResourceNotFoundException;
import com.example.taller_persisntencia2.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    private static final LocalDateTime PURCHASE_DATE = LocalDateTime.of(2026, 10, 11, 10, 30);

    private static final String VALID_JSON = """
            {
              "userEmail": "andrea@example.com",
              "eventCode": "CMF-2026",
              "type": "GENERAL"
            }
            """;

    private PurchaseTicketRequest validRequest() {
        return new PurchaseTicketRequest("andrea@example.com", "CMF-2026", TicketType.GENERAL);
    }

    private TicketResponse ticket(TicketStatus status) {
        return new TicketResponse(1L, "TKT-0001", TicketType.GENERAL, new BigDecimal("150000"),
                status, PURCHASE_DATE, "andrea@example.com", "CMF-2026", "Caribbean Music Fest 2026");
    }

    // TEST-CTRL-TKT-001
    @Test
    void purchase_validRequest_returns201() throws Exception {
        when(ticketService.purchase(validRequest())).thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TKT-0001"))
                .andExpect(jsonPath("$.type").value("GENERAL"))
                .andExpect(jsonPath("$.price").value(150000))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.userEmail").value("andrea@example.com"))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.eventName").value("Caribbean Music Fest 2026"));

        verify(ticketService).purchase(validRequest());
    }

    // TEST-CTRL-TKT-002
    @Test
    void purchase_missingFields_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.userEmail").value("User email is required"))
                .andExpect(jsonPath("$.details.eventCode").value("Event code is required"))
                .andExpect(jsonPath("$.details.type").value("Ticket type is required"));

        verify(ticketService, never()).purchase(any());
    }

    // Extra: email con formato inválido
    @Test
    void purchase_invalidEmail_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON.replace("andrea@example.com", "not-an-email")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.userEmail").value("User email must be valid"));

        verify(ticketService, never()).purchase(any());
    }

    // Extra: tipo de ticket que no existe en el enum
    @Test
    void purchase_unknownType_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON.replace("GENERAL", "NOT_A_TYPE")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed JSON request"));

        verify(ticketService, never()).purchase(any());
    }

    // TEST-CTRL-TKT-003
    @Test
    void purchase_unknownUser_returns404() throws Exception {
        when(ticketService.purchase(validRequest()))
                .thenThrow(new ResourceNotFoundException("User not found: andrea@example.com"));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("User not found: andrea@example.com"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(ticketService).purchase(validRequest());
    }

    // TEST-CTRL-TKT-004 (también cubre AC-CTRL010: menor de edad)
    @Test
    void purchase_businessRuleViolation_returns409() throws Exception {
        when(ticketService.purchase(validRequest()))
                .thenThrow(new BusinessRuleException("User does not meet minimum age"));

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("User does not meet minimum age"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(ticketService).purchase(validRequest());
    }

    // TEST-CTRL-TKT-005
    @Test
    void findByCode_existingTicket_returns200() throws Exception {
        when(ticketService.findByCode("TKT-0001")).thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(get("/api/tickets/TKT-0001"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TKT-0001"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.purchaseDate").value("2026-10-11T10:30:00"));

        verify(ticketService).findByCode("TKT-0001");
    }

    // Extra: FR-CTRLTKT-002 pide 200 o 404
    @Test
    void findByCode_unknownTicket_returns404() throws Exception {
        when(ticketService.findByCode("XXX"))
                .thenThrow(new ResourceNotFoundException("Ticket not found: XXX"));

        mockMvc.perform(get("/api/tickets/XXX"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Ticket not found: XXX"));

        verify(ticketService).findByCode("XXX");
    }

    // TEST-CTRL-TKT-006
    @Test
    void findByUserEmail_returns200() throws Exception {
        when(ticketService.findByUserEmail("andrea@example.com"))
                .thenReturn(List.of(ticket(TicketStatus.PAID)));

        mockMvc.perform(get("/api/tickets/by-user").param("email", "andrea@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].ticketCode").value("TKT-0001"))
                .andExpect(jsonPath("$[0].userEmail").value("andrea@example.com"));

        verify(ticketService).findByUserEmail("andrea@example.com");
    }

    // Extra: falta el parámetro email
    @Test
    void findByUserEmail_missingParam_returns400WithoutCallingService() throws Exception {
        mockMvc.perform(get("/api/tickets/by-user"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.email").value("Parameter is required"));

        verify(ticketService, never()).findByUserEmail(anyString());
    }

    // TEST-CTRL-TKT-007
    @Test
    void findPaidTicketsByEvent_returns200() throws Exception {
        when(ticketService.findPaidTicketsByEvent("CMF-2026"))
                .thenReturn(List.of(ticket(TicketStatus.PAID)));

        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("PAID"))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"));

        verify(ticketService).findPaidTicketsByEvent("CMF-2026");
    }

    // Extra: evento inexistente
    @Test
    void findPaidTicketsByEvent_unknownEvent_returns404() throws Exception {
        when(ticketService.findPaidTicketsByEvent("XXX"))
                .thenThrow(new ResourceNotFoundException("Event not found: XXX"));

        mockMvc.perform(get("/api/events/XXX/tickets/paid"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Event not found: XXX"));

        verify(ticketService).findPaidTicketsByEvent("XXX");
    }

    // TEST-CTRL-TKT-008 (AC-CTRL011)
    @Test
    void cancel_paidTicket_returns200() throws Exception {
        when(ticketService.cancel("TKT-0001")).thenReturn(ticket(TicketStatus.CANCELLED));

        mockMvc.perform(patch("/api/tickets/TKT-0001/cancel"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TKT-0001"))
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TKT-0001");
    }

    // TEST-CTRL-TKT-009 (AC-CTRL012)
    @Test
    void cancel_usedTicket_returns409() throws Exception {
        when(ticketService.cancel("TKT-0001"))
                .thenThrow(new BusinessRuleException("Used ticket cannot be cancelled: TKT-0001"));

        mockMvc.perform(patch("/api/tickets/TKT-0001/cancel"))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Used ticket cannot be cancelled: TKT-0001"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(ticketService).cancel("TKT-0001");
    }

    // Extra: cancelar un ticket inexistente
    @Test
    void cancel_unknownTicket_returns404() throws Exception {
        when(ticketService.cancel("XXX"))
                .thenThrow(new ResourceNotFoundException("Ticket not found: XXX"));

        mockMvc.perform(patch("/api/tickets/XXX/cancel"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found: XXX"));

        verify(ticketService).cancel("XXX");
    }

    // TEST-CTRL-TKT-010 (AC-CTRL013)
    @Test
    void markAsUsed_paidTicket_returns200() throws Exception {
        when(ticketService.markAsUsed("TKT-0001")).thenReturn(ticket(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/TKT-0001/use"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TKT-0001"))
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TKT-0001");
    }

    // TEST-CTRL-TKT-011 (AC-CTRL014)
    @Test
    void markAsUsed_cancelledTicket_returns409() throws Exception {
        when(ticketService.markAsUsed("TKT-0001"))
                .thenThrow(new BusinessRuleException("Cancelled ticket cannot be used: TKT-0001"));

        mockMvc.perform(patch("/api/tickets/TKT-0001/use"))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Cancelled ticket cannot be used: TKT-0001"))
                .andExpect(jsonPath("$.details").isEmpty());

        verify(ticketService).markAsUsed("TKT-0001");
    }

    // Extra: usar un ticket inexistente
    @Test
    void markAsUsed_unknownTicket_returns404() throws Exception {
        when(ticketService.markAsUsed("XXX"))
                .thenThrow(new ResourceNotFoundException("Ticket not found: XXX"));

        mockMvc.perform(patch("/api/tickets/XXX/use"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found: XXX"));

        verify(ticketService).markAsUsed("XXX");
    }
}