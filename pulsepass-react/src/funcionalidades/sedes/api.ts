import { solicitar } from '../../lib/http'
import { VenueListSchema, VenueResponseSchema } from './tipos'

export const obtenerSedesActivas = (signal?: AbortSignal) =>
    solicitar('/venues/active', { esquema: VenueListSchema, signal })

export const obtenerSede = (code: string, signal?: AbortSignal) =>
    solicitar(`/venues/${encodeURIComponent(code)}`, { esquema: VenueResponseSchema, signal })