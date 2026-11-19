import { solicitar } from '../../lib/http'
import {
    AuthenticatedUserResponseSchema,
    AuthResponseSchema,
    type LoginRequest,
} from './tipos'

export function iniciarSesionApi(credenciales: LoginRequest) {
    return solicitar('/auth/login', {
        metodo: 'POST',
        cuerpo: credenciales,
        esquema: AuthResponseSchema,
    })
}

export function obtenerMe(signal?: AbortSignal) {
    return solicitar('/auth/me', { esquema: AuthenticatedUserResponseSchema, signal })
}