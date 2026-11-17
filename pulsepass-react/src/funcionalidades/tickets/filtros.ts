import type { TicketResponse, TicketStatus } from './tipos'

export type FiltroTicket = 'TODOS' | Extract<TicketStatus, 'PAID' | 'USED' | 'CANCELLED'>

export const OPCIONES_FILTRO: { valor: FiltroTicket; etiqueta: string }[] = [
    { valor: 'TODOS', etiqueta: 'Todos' },
    { valor: 'PAID', etiqueta: 'Pagados' },
    { valor: 'USED', etiqueta: 'Usados' },
    { valor: 'CANCELLED', etiqueta: 'Cancelados' },
]

export function filtrarTickets(tickets: TicketResponse[], filtro: FiltroTicket): TicketResponse[] {
    return filtro === 'TODOS' ? tickets : tickets.filter((t) => t.status === filtro)
}