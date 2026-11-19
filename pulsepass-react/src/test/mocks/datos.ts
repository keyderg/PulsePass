import { HttpResponse } from 'msw'
import type { ArtistResponse } from '../../funcionalidades/artistas/tipos'
import type { EventResponse, EventSummaryResponse } from '../../funcionalidades/eventos/tipos'
import type { VenueResponse } from '../../funcionalidades/sedes/tipos'
import type { TicketResponse, TicketType } from '../../funcionalidades/tickets/tipos'
import type { UserResponse } from '../../funcionalidades/usuarios/tipos'

// Escenario de la sección 22 del PRD.
export const sede: VenueResponse = {
    id: 1,
    code: 'VEN-SMR-01',
    name: 'Marina Convention Center',
    city: 'Santa Marta',
    address: 'Carrera 1 # 2-3',
    capacity: 3,
    active: true,
}

export const artistas: ArtistResponse[] = [
    { id: 1, stageName: 'Solar Beat', country: 'Colombia', genre: 'Electrónica', active: true },
    { id: 2, stageName: 'Neon Waves', country: 'Colombia', genre: 'Synthwave', active: true },
    { id: 3, stageName: 'Caribbean Sound', country: 'Colombia', genre: 'Caribeña', active: true },
]

export const evento: EventResponse = {
    id: 1,
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    description: 'Tres noches de música caribeña frente a la bahía de Santa Marta.',
    category: 'MUSIC',
    status: 'PUBLISHED',
    eventDate: '2026-12-12T20:00:00',
    minimumAge: 18,
    venueCode: sede.code,
    venueName: sede.name,
    artists: [artistas[0], artistas[1]].filter((a): a is ArtistResponse => a !== undefined),
}

export const resumenEventos: EventSummaryResponse[] = [
    {
        eventCode: evento.eventCode,
        name: evento.name,
        status: 'PUBLISHED',
        eventDate: evento.eventDate,
        venueName: evento.venueName,
    },
]

export const andrea: UserResponse = {
    id: 10,
    username: 'andrea',
    email: 'andrea@pulsepass.test',
    firstName: 'Andrea',
    lastName: 'Pérez',
    birthDate: '1998-04-10',
    active: true,
}

export const ticketAndrea: TicketResponse = {
    id: 100,
    ticketCode: 'TKT-8F2A1C',
    type: 'VIP',
    price: 250000,
    status: 'PAID',
    purchaseDate: '2026-11-08T10:00:00',
    userEmail: andrea.email,
    eventCode: evento.eventCode,
    eventName: evento.name,
}

export const PRECIOS: Record<TicketType, number> = {
    GENERAL: 120000,
    VIP: 250000,
    BACKSTAGE: 400000,
    STUDENT: 80000,
}

export const CLAVE_ANDREA = 'Clave-Segura-123'
export const TOKEN_ANDREA = 'token-andrea'

export function errorApi(
    status: number,
    error: string,
    message: string,
    details: Record<string, string> = {},
) {
    return HttpResponse.json(
        { timestamp: '2026-11-16T20:00:00', status, error, message, details },
        { status },
    )
}