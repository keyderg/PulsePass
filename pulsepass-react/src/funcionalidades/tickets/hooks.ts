import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { claves, invalidaciones, STALE } from '../../lib/queryKeys'
import { useAuth } from '../auth/hooks'
import { useUsuarioPorEmail } from '../usuarios/hooks'
import {
    cancelarTicket,
    comprarTicket,
    obtenerTicket,
    obtenerTicketsDeUsuario,
    obtenerTicketsPagados,
    usarTicket,
} from './api'
import type { TicketType } from './tipos'

function useEmailSesion(): string | undefined {
    const { sesion } = useAuth()
    return sesion.estado === 'autenticado' ? sesion.usuario.email : undefined
}

/** GET /tickets/by-user?email=<sesión>. El email nunca viene de un campo editable. */
export function useMisTickets() {
    const email = useEmailSesion()
    return useQuery({
        queryKey: claves.ticketsUsuario(email ?? ''),
        queryFn: ({ signal }) => obtenerTicketsDeUsuario(email ?? '', signal),
        enabled: Boolean(email),
        staleTime: STALE.tickets,
    })
}

export function useTicket(ticketCode: string | undefined) {
    return useQuery({
        queryKey: claves.ticket(ticketCode ?? ''),
        queryFn: ({ signal }) => obtenerTicket(ticketCode ?? '', signal),
        enabled: Boolean(ticketCode),
        staleTime: STALE.tickets,
    })
}

/** Consulta bajo demanda para la puerta: siempre fresca (staleTime 0) y solo con código. */
export function useBuscarTicket(ticketCode: string | undefined) {
    return useQuery({
        queryKey: claves.ticket(ticketCode ?? ''),
        queryFn: ({ signal }) => obtenerTicket(ticketCode ?? '', signal),
        enabled: Boolean(ticketCode),
        staleTime: 0,
    })
}

export function useTicketsPagadosPorEvento(eventCode: string | undefined) {
    return useQuery({
        queryKey: claves.ticketsPagados(eventCode ?? ''),
        queryFn: ({ signal }) => obtenerTicketsPagados(eventCode ?? '', signal),
        enabled: Boolean(eventCode),
        staleTime: STALE.tickets,
    })
}

export function useComprarTicket() {
    const qc = useQueryClient()
    const email = useEmailSesion()
    return useMutation({
        mutationFn: (datos: { eventCode: string; type: TicketType }) => {
            if (!email) throw new Error('No hay sesión activa')
            return comprarTicket({ userEmail: email, eventCode: datos.eventCode, type: datos.type })
        },
        onSuccess: (ticket) => {
            // La confirmación no necesita volver a pedir el ticket recién creado.
            qc.setQueryData(claves.ticket(ticket.ticketCode), ticket)
            void invalidaciones.comprarTicket(qc, ticket.userEmail, ticket.eventCode)
        },
    })
}

export function useCancelarTicket() {
    const qc = useQueryClient()
    const email = useEmailSesion()
    return useMutation({
        mutationFn: cancelarTicket,
        onSuccess: (ticket) => {
            qc.setQueryData(claves.ticket(ticket.ticketCode), ticket)
            void invalidaciones.cancelarTicket(qc, email ?? ticket.userEmail, ticket.ticketCode, ticket.eventCode)
        },
    })
}

export function useUsarTicket() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: usarTicket,
        onSuccess: (ticket) => {
            void invalidaciones.usarTicket(qc, ticket.ticketCode, ticket.eventCode)
        },
    })
}

/**
 * La API del ticket solo trae el email del titular. Se busca su nombre; si no hay permiso
 * (por ejemplo STAFF) o falla, se muestra el email. La sesión ya siembra su propio perfil en caché.
 */
export function useTitular(email: string): string {
    const consulta = useUsuarioPorEmail(email)
    return consulta.data ? `${consulta.data.firstName} ${consulta.data.lastName}` : email
}