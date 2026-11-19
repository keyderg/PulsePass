import { solicitar } from '../../lib/http'
import {
    EventResponseSchema,
    EventSummaryListSchema,
    type CreateEventRequest,
} from './tipos'


export const obtenerEventosPublicados = (signal?: AbortSignal) =>
    solicitar('/events/published', { esquema: EventSummaryListSchema, signal })

export const obtenerEvento = (eventCode: string, signal?: AbortSignal) =>
    solicitar(`/events/${encodeURIComponent(eventCode)}`, { esquema: EventResponseSchema, signal })

export const obtenerEventosPorArtista = (stageName: string, signal?: AbortSignal) =>
    solicitar('/events/by-artist', {
        parametros: { stageName },
        esquema: EventSummaryListSchema,
        signal,
    })

export const crearEvento = (datos: CreateEventRequest) =>
    solicitar('/events', { metodo: 'POST', cuerpo: datos, esquema: EventResponseSchema })

export const publicarEvento = (eventCode: string) =>
    solicitar(`/events/${encodeURIComponent(eventCode)}/publish`, {
        metodo: 'PATCH',
        esquema: EventResponseSchema,
    })

export const asociarArtista = (eventCode: string, artistId: number) =>
    solicitar(`/events/${encodeURIComponent(eventCode)}/artists/${artistId}`, {
        metodo: 'POST',
        esquema: EventResponseSchema,
    })