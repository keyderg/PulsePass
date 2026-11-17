import { ApiError } from './apiError'

export interface ContextoError {
    /** En el login, un 401 significa "credenciales inválidas", no "sesión expirada". */
    login?: boolean
    /** Mensaje para 404 según el pantalla (por ejemplo "Evento no disponible"). */
    noEncontrado?: string
}

export const MENSAJES = {
    red: 'No pudimos conectar con el servidor.',
    datosInvalidos: 'Revisa los datos ingresados.',
    credenciales: 'Credenciales inválidas',
    sesionExpirada: 'Tu sesión expiró. Inicia sesión de nuevo.',
    sinPermisos: 'No tienes permisos para realizar esta acción.',
    noEncontrado: 'No encontramos lo que buscas.',
    reglaNegocio: 'No se pudo completar la operación.',
    inesperado: 'Ocurrió un error inesperado. Inténtalo más tarde.',
} as const

/** Traduce cualquier error a un texto de interfaz (sección 13). Siempre se renderiza como texto. */
export function mensajeDeError(error: unknown, contexto: ContextoError = {}): string {
    if (!(error instanceof ApiError)) return MENSAJES.inesperado
    if (error.esRed) return MENSAJES.red

    switch (error.status) {
        case 400:
            return MENSAJES.datosInvalidos
        case 401:
            return contexto.login ? MENSAJES.credenciales : MENSAJES.sesionExpirada
        case 403:
            return MENSAJES.sinPermisos
        case 404:
            return contexto.noEncontrado ?? MENSAJES.noEncontrado
        case 409:
            return error.generico ? MENSAJES.reglaNegocio : error.message
        default:
            return MENSAJES.inesperado
    }
}