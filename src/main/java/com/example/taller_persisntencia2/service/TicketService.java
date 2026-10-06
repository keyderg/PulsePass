package com.example.taller_persisntencia2.service;

import com.example.taller_persisntencia2.dto.request.PurchaseTicketRequest;
import com.example.taller_persisntencia2.dto.response.TicketResponse;
import java.util.List;

public interface TicketService {
    TicketResponse purchase(PurchaseTicketRequest request);
    TicketResponse findByCode(String ticketCode);
    List<TicketResponse> findByUserEmail(String email);
    List<TicketResponse> findPaidTicketsByEvent(String eventCode);
    TicketResponse cancel(String ticketCode);
    TicketResponse markAsUsed(String ticketCode);
}
