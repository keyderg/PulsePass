import { solicitar } from '../../lib/http'
import { UserResponseSchema, type RegisterUserRequest } from './tipos'

export function registrarUsuario(datos: RegisterUserRequest) {
    return solicitar('/users', { metodo: 'POST', cuerpo: datos, esquema: UserResponseSchema })
}

export function obtenerUsuarioPorEmail(email: string, signal?: AbortSignal) {
    return solicitar('/users/by-email', {
        parametros: { email },
        esquema: UserResponseSchema,
        signal,
    })
}

export function obtenerUsuarioPorUsername(username: string, signal?: AbortSignal) {
    return solicitar('/users/by-username', {
        parametros: { username },
        esquema: UserResponseSchema,
        signal,
    })
}