import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { configurarSesionHttp } from '../../lib/http'
import { claves } from '../../lib/queryKeys'
import { obtenerUsuarioPorUsername } from '../usuarios/api'
import { iniciarSesionApi, obtenerMe } from './api'
import {
    borrarCredencial,
    guardarCredencial,
    obtenerTokenActual,
    restaurarCredencial,
    type Credencial,
} from './almacen'
import { AuthContext, type AuthContextValor } from './contexto'
import type { Rol, Sesion, UsuarioAutenticado } from './tipos'

interface AuthProviderProps {
    children: ReactNode
    /** Reloj inyectable (pruebas deterministas). */
    ahora?: () => number
}

export function AuthProvider({ children, ahora = Date.now }: AuthProviderProps) {
    const queryClient = useQueryClient()
    const [credencial, setCredencial] = useState<Credencial | null>(() =>
        restaurarCredencial(ahora()),
    )
    const [motivo, setMotivo] = useState<'expirada' | null>(null)

    const finalizarSesion = useCallback(
        (porQue: 'expirada' | null) => {
            borrarCredencial()
            setCredencial(null)
            setMotivo(porQue)
            queryClient.clear()
        },
        [queryClient],
    )

    // Layout effect: se registra antes de que cualquier consulta (efectos pasivos) salga a la red.
    useLayoutEffect(() => {
        configurarSesionHttp({
            obtenerToken: obtenerTokenActual,
            alSesionExpirada: () => finalizarSesion('expirada'),
        })
    }, [finalizarSesion])

    const cargarSesion = useCallback(
        async (signal?: AbortSignal): Promise<UsuarioAutenticado> => {
            const me = await obtenerMe(signal)
            const perfil = await obtenerUsuarioPorUsername(me.username, signal)
            queryClient.setQueryData(claves.usuario(perfil.email), perfil)
            return {
                id: me.id,
                username: me.username,
                email: perfil.email,
                nombre: perfil.firstName,
                roles: me.roles,
            }
        },
        [queryClient],
    )

    const consulta = useQuery({
        queryKey: claves.sesion(),
        queryFn: ({ signal }) => cargarSesion(signal),
        enabled: credencial !== null,
        staleTime: Infinity,
    })

    // Token rechazado o /auth/me caído al restaurar: se descarta la credencial.
    useEffect(() => {
        if (credencial && consulta.isError) finalizarSesion(null)
    }, [credencial, consulta.isError, finalizarSesion])

    // Cierre local al vencer expiraEn.
    useEffect(() => {
        if (!credencial) return
        const id = setTimeout(
            () => finalizarSesion('expirada'),
            Math.max(credencial.expiraEn - ahora(), 0),
        )
        return () => clearTimeout(id)
    }, [credencial, ahora, finalizarSesion])

    const iniciarSesion = useCallback(
        async (identifier: string, password: string) => {
            const auth = await iniciarSesionApi({ identifier, password })
            const nueva: Credencial = { token: auth.accessToken, expiraEn: ahora() + auth.expiresIn * 1000 }
            guardarCredencial(nueva)
            try {
                await queryClient.fetchQuery({
                    queryKey: claves.sesion(),
                    queryFn: ({ signal }) => cargarSesion(signal),
                    staleTime: Infinity,
                })
            } catch (error: unknown) {
                borrarCredencial()
                queryClient.removeQueries({ queryKey: claves.sesion() })
                throw error
            }
            setMotivo(null)
            setCredencial(nueva)
        },
        [ahora, cargarSesion, queryClient],
    )

    const cerrarSesion = useCallback(() => finalizarSesion(null), [finalizarSesion])

    const sesion = useMemo<Sesion>(() => {
        if (!credencial) return { estado: 'anonimo', motivo }
        if (consulta.data) {
            return {
                estado: 'autenticado',
                token: credencial.token,
                expiraEn: credencial.expiraEn,
                usuario: consulta.data,
            }
        }
        if (consulta.isError) return { estado: 'anonimo', motivo: null }
        return { estado: 'cargando' }
    }, [credencial, motivo, consulta.data, consulta.isError])

    const tieneRol = useCallback(
        (...roles: Rol[]) =>
            sesion.estado === 'autenticado' && roles.some((r) => sesion.usuario.roles.includes(r)),
        [sesion],
    )

    const valor = useMemo<AuthContextValor>(
        () => ({ sesion, iniciarSesion, cerrarSesion, tieneRol }),
        [sesion, iniciarSesion, cerrarSesion, tieneRol],
    )

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}