import { useQueries, useQuery } from '@tanstack/react-query'
import { claves, STALE } from '../../lib/queryKeys'
import { useSedesActivas } from '../sedes/hooks'
import { obtenerEvento, obtenerEventosPorArtista, obtenerEventosPublicados } from './api'
import type { EventoTarjeta, EventSummaryResponse } from './tipos'

export function useEventosPublicados() {
    return useQuery({
        queryKey: claves.eventosPublicados(),
        queryFn: ({ signal }) => obtenerEventosPublicados(signal),
        staleTime: STALE.eventosPublicados,
    })
}

export function useEvento(eventCode: string | undefined) {
    return useQuery({
        queryKey: claves.evento(eventCode ?? ''),
        queryFn: ({ signal }) => obtenerEvento(eventCode ?? '', signal),
        enabled: Boolean(eventCode),
        staleTime: STALE.evento,
    })
}

export function useEventosPorArtista(stageName: string | undefined) {
    return useQuery({
        queryKey: claves.eventosPorArtista(stageName ?? ''),
        queryFn: ({ signal }) => obtenerEventosPorArtista(stageName ?? '', signal),
        enabled: Boolean(stageName),
        staleTime: STALE.eventosPorArtista,
    })
}

/** Completa cada resumen con categoría (detalle, caché compartida) y ciudad (sedes activas). */
export function useEventosConDetalle(resumenes: EventSummaryResponse[] | undefined): EventoTarjeta[] {
    const lista = resumenes ?? []
    const sedes = useSedesActivas()
    const detalles = useQueries({
        queries: lista.map((e) => ({
            queryKey: claves.evento(e.eventCode),
            queryFn: ({ signal }: { signal: AbortSignal }) => obtenerEvento(e.eventCode, signal),
            staleTime: STALE.evento,
        })),
    })
    return lista.map((e, i) => ({
        ...e,
        ciudad: sedes.data?.find((s) => s.name === e.venueName)?.city,
        categoria: detalles[i]?.data?.category,
    }))
}