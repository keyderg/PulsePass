import { solicitar } from '../../lib/http'
import { ArtistListSchema, ArtistResponseSchema } from './tipos'

export const obtenerArtistasActivos = (signal?: AbortSignal) =>
    solicitar('/artists/active', { esquema: ArtistListSchema, signal })

export const obtenerArtista = (id: number, signal?: AbortSignal) =>
    solicitar(`/artists/${id}`, { esquema: ArtistResponseSchema, signal })

export const obtenerArtistaPorNombre = (stageName: string, signal?: AbortSignal) =>
    solicitar('/artists/by-stage-name', {
        parametros: { stageName },
        esquema: ArtistResponseSchema,
        signal,
    })