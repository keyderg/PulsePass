import { useCallback, useContext } from 'react'
import { useNavigate } from 'react-router'
import { RUTAS } from '../../lib/rutas'
import { AuthContext, type AuthContextValor } from './contexto'

export function useAuth(): AuthContextValor {
    const contexto = useContext(AuthContext)
    if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
    return contexto
}

/** Navega a / y después cierra sesión (así la guarda no redirige a /login durante la salida). */
export function useSalir(): () => Promise<void> {
    const { cerrarSesion } = useAuth()
    const navigate = useNavigate()
    return useCallback(async () => {
        await navigate(RUTAS.inicio)
        cerrarSesion()
    }, [cerrarSesion, navigate])
}