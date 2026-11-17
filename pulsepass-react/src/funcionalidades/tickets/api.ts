import { solicitar } from '../../lib/http'
import {
    PurchaseTicketRequestSchema,
    TicketListSchema,
    TicketResponseSchema,
    type PurchaseTicketRequest,
} from './tipos'

const rutaTicket = (codigo: string) => `/tickets/${encodeURIComponent(codigo)}`

export function comprarTicket(datos: PurchaseTicketRequest) {
    return solicitar('/tickets', {
        metodo: 'POST',
        cuerpo: PurchaseTicketRequestSchema.parse(datos),
        esquema: TicketResponseSchema,
    })
}

export function obtenerTicketsDeUsuario(email: string, signal?: AbortSignal) {
    return solicitar('/tickets/by-user', {
        parametros: { email },
        esquema: TicketListSchema,
        signal,
    })
}

export function obtenerTicket(codigo: string, signal?: AbortSignal) {
    return solicitar(rutaTicket(codigo), { esquema: TicketResponseSchema, signal })
}

export function cancelarTicket(codigo: string) {
    return solicitar(`${rutaTicket(codigo)}/cancel`, {
        metodo: 'PATCH',
        esquema: TicketResponseSchema,
    })
}

export function usarTicket(codigo: string) {
    return solicitar(`${rutaTicket(codigo)}/use`, {
        metodo: 'PATCH',
        esquema: TicketResponseSchema,
    })
}

export function obtenerTicketsPagados(eventCode: string, signal?: AbortSignal) {
    return solicitar(`/events/${encodeURIComponent(eventCode)}/tickets/paid`, {
        esquema: TicketListSchema,
        signal,
    })
}