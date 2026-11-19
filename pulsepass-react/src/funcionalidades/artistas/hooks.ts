import { useQuery } from '@tanstack/react-query'
import { claves, STALE } from '../../lib/queryKeys'
import { obtenerArtista, obtenerArtistaPorNombre, obtenerArtistasActivos } from './api'

export function useArtistasActivos() {
    return useQuery({
        queryKey: claves.artistasActivos(),
        queryFn: ({ signal }) => obtenerArtistasActivos(signal),
        staleTime: STALE.artistas,
    })
}

/** `id` undefined (parámetro inválido) → no hay petición. */
export function useArtista(id: number | undefined) {
    return useQuery({
        queryKey: claves.artista(id ?? 0),
        queryFn: ({ signal }) => obtenerArtista(id ?? 0, signal),
        enabled: id !== undefined,
        staleTime: STALE.artistas,
    })
}

export function useArtistaPorNombre(stageName: string | undefined) {
    return useQuery({
        queryKey: claves.artistaPorNombre(stageName ?? ''),
        queryFn: ({ signal }) => obtenerArtistaPorNombre(stageName ?? '', signal),
        enabled: Boolean(stageName),
        staleTime: STALE.artistas,
    })
}