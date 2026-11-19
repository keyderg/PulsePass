import { useQuery } from '@tanstack/react-query'
import { claves, STALE } from '../../lib/queryKeys'
import { obtenerSede, obtenerSedesActivas } from './api'

export function useSedesActivas() {
    return useQuery({
        queryKey: claves.sedesActivas(),
        queryFn: ({ signal }) => obtenerSedesActivas(signal),
        staleTime: STALE.sedes,
    })
}

export function useSede(code: string | undefined) {
    return useQuery({
        queryKey: claves.sede(code ?? ''),
        queryFn: ({ signal }) => obtenerSede(code ?? '', signal),
        enabled: Boolean(code),
        staleTime: STALE.sedes,
    })
}