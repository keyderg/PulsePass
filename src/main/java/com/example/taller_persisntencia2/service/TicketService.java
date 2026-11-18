package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.dto.request.PurchaseTicketRequest;
import com.example.taller_persisntencia2.dto.response.TicketResponse;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface TicketService {

    @PreAuthorize("hasRole('USER') and @authorizationService.isPrincipalEmail(#request.userEmail())")
    TicketResponse purchase(PurchaseTicketRequest request);

    @PreAuthorize("@authorizationService.canViewTicket(#ticketCode)")
    TicketResponse findByCode(String ticketCode);

    @PreAuthorize("hasRole('ADMIN') or @authorizationService.isPrincipalEmail(#email)")
    List<TicketResponse> findByUserEmail(String email);

    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    List<TicketResponse> findPaidTicketsByEvent(String eventCode);

    @PreAuthorize("@authorizationService.canCancelTicket(#ticketCode)")
    TicketResponse cancel(String ticketCode);

    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    TicketResponse markAsUsed(String ticketCode);
}