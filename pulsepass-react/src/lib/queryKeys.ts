import type { QueryClient } from '@tanstack/react-query'
import type { EventResponse } from '../funcionalidades/eventos/tipos'

/** Claves de consulta (sección 14.1). Toda clave se construye aquí, nunca inline. */
export const claves = {
    eventosPublicados: () => ['eventos', 'publicados'] as const,
    evento: (eventCode: string) => ['evento', eventCode] as const,
    eventosPorArtista: (stageName: string) => ['eventos', 'artista', stageName] as const,
    artistasActivos: () => ['artistas', 'activos'] as const,
    artista: (id: number) => ['artista', id] as const,
    artistaPorNombre: (stageName: string) => ['artista', 'nombre', stageName] as const,
    sedesActivas: () => ['sedes', 'activas'] as const,
    sede: (code: string) => ['sede', code] as const,
    usuario: (email: string) => ['usuario', email] as const,
    usuarioPorUsername: (username: string) => ['usuario', 'username', username] as const,
    ticketsUsuario: (email: string) => ['tickets', 'usuario', email] as const,
    ticket: (ticketCode: string) => ['ticket', ticketCode] as const,
    ticketsPagados: (eventCode: string) => ['tickets', 'pagados', eventCode] as const,
    sesion: () => ['sesion'] as const,
}

const SEGUNDO = 1000
const MINUTO = 60 * SEGUNDO

export const STALE = {
    eventosPublicados: 60 * SEGUNDO,
    evento: 30 * SEGUNDO,
    eventosPorArtista: 60 * SEGUNDO,
    artistas: 5 * MINUTO,
    sedes: 5 * MINUTO,
    usuario: 60 * SEGUNDO,
    tickets: 15 * SEGUNDO,
} as const

function invalidar(qc: QueryClient, ...keys: readonly (readonly unknown[])[]): Promise<unknown> {
    return Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })))
}

/** Invalidaciones tras mutaciones (sección 14.2). Los hooks de mutación las llaman en onSuccess. */
export const invalidaciones = {
    comprarTicket: (qc: QueryClient, email: string, eventCode: string) =>
        invalidar(qc, claves.ticketsUsuario(email), claves.evento(eventCode)),
    cancelarTicket: (qc: QueryClient, email: string, ticketCode: string, eventCode: string) =>
        invalidar(
            qc,
            claves.ticketsUsuario(email),
            claves.ticket(ticketCode),
            claves.ticketsPagados(eventCode),
        ),
    usarTicket: (qc: QueryClient, ticketCode: string, eventCode: string) =>
        invalidar(qc, claves.ticket(ticketCode), claves.ticketsPagados(eventCode)),
    publicarEvento: (qc: QueryClient, eventCode: string) =>
        invalidar(qc, claves.evento(eventCode), claves.eventosPublicados()),
    asociarArtista: (qc: QueryClient, eventCode: string, stageName: string) =>
        invalidar(qc, claves.evento(eventCode), claves.eventosPorArtista(stageName)),
    /** useCrearEvento: se siembra la caché con el resultado en lugar de invalidar. */
    crearEvento: (qc: QueryClient, evento: EventResponse) =>
        qc.setQueryData(claves.evento(evento.eventCode), evento),
}