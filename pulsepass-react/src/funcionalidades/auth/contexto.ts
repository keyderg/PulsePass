import { createContext } from 'react'
import type { Rol, Sesion } from './tipos'

export interface AuthContextValor {
    sesion: Sesion
    iniciarSesion: (identifier: string, password: string) => Promise<void>
    cerrarSesion: () => void
    tieneRol: (...roles: Rol[]) => boolean
}

export const AuthContext = createContext<AuthContextValor | null>(null)