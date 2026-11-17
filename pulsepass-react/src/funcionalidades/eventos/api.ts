import { solicitar } from '../../lib/http'
import { EventResponseSchema, EventSummaryListSchema } from './tipos'

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