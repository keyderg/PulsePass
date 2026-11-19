import { useMutation, useQuery } from '@tanstack/react-query'
import { claves, STALE } from '../../lib/queryKeys'
import { obtenerUsuarioPorEmail, obtenerUsuarioPorUsername, registrarUsuario } from './api'

export function useUsuarioPorEmail(email: string | undefined) {
    return useQuery({
        queryKey: claves.usuario(email ?? ''),
        queryFn: ({ signal }) => obtenerUsuarioPorEmail(email ?? '', signal),
        enabled: Boolean(email),
        staleTime: STALE.usuario,
    })
}

export function useUsuarioPorUsername(username: string | undefined) {
    return useQuery({
        queryKey: claves.usuarioPorUsername(username ?? ''),
        queryFn: ({ signal }) => obtenerUsuarioPorUsername(username ?? '', signal),
        enabled: Boolean(username),
        staleTime: STALE.usuario,
    })
}

export function useRegistrarUsuario() {
    return useMutation({ mutationFn: registrarUsuario })
}