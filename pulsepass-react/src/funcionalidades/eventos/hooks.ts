import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { claves, invalidaciones, STALE } from '../../lib/queryKeys'
import type { ArtistResponse } from '../artistas/tipos'
import { useSedesActivas } from '../sedes/hooks'
import {
    asociarArtista,
    crearEvento,
    obtenerEvento,
    obtenerEventosPorArtista,
    obtenerEventosPublicados,
    publicarEvento,
} from './api'
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

/** Códigos de los eventos creados en esta sesión (GAP-01). Vive en la caché: se limpia al cerrar sesión. */
export function useEventosCreados() {
    return useQuery({
        queryKey: claves.eventosCreados(),
        queryFn: () => Promise.resolve<string[]>([]),
        initialData: [] as string[],
        staleTime: Infinity,
    })
}

export function useCrearEvento() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: crearEvento,
        onSuccess: (evento) => {
            invalidaciones.crearEvento(qc, evento)
            qc.setQueryData<string[]>(claves.eventosCreados(), (previos) => [
                evento.eventCode,
                ...(previos ?? []).filter((c) => c !== evento.eventCode),
            ])
        },
    })
}

export function usePublicarEvento() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: publicarEvento,
        onSuccess: (evento) => {
            qc.setQueryData(claves.evento(evento.eventCode), evento)
            void invalidaciones.publicarEvento(qc, evento.eventCode)
        },
    })
}

export function useAsociarArtista() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (v: { eventCode: string; artista: ArtistResponse }) =>
            asociarArtista(v.eventCode, v.artista.id),
        onSuccess: (evento, v) => {
            qc.setQueryData(claves.evento(evento.eventCode), evento)
            void invalidaciones.asociarArtista(qc, v.eventCode, v.artista.stageName)
        },
    })
}