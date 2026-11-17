import type { z } from 'zod'
import { ApiError, ErrorResponseSchema } from './apiError'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** La sesión completa se implementa en la Parte 3 (AuthContext llama a configurarSesionHttp). */
export interface ConfigSesionHttp {
    obtenerToken: () => string | null
    /** Se invoca ante un 401 cuando la petición llevaba token (sesión vencida o inválida). */
    alSesionExpirada: () => void
}

const SESION_VACIA: ConfigSesionHttp = {
    obtenerToken: () => null,
    alSesionExpirada: () => undefined,
}

let config: ConfigSesionHttp = SESION_VACIA

export function configurarSesionHttp(nueva: ConfigSesionHttp): void {
    config = nueva
}

export function restablecerSesionHttp(): void {
    config = SESION_VACIA
}

export interface OpcionesSolicitud<T> {
    esquema: z.ZodType<T>
    metodo?: 'GET' | 'POST' | 'PATCH'
    cuerpo?: unknown
    parametros?: Record<string, string>
    signal?: AbortSignal
}

function construirUrl(ruta: string, parametros?: Record<string, string>): URL {
    const url = new URL(`${BASE_URL}${ruta}`, window.location.origin)
    for (const [clave, valor] of Object.entries(parametros ?? {})) {
        url.searchParams.set(clave, valor)
    }
    return url
}

async function leerJson(respuesta: Response): Promise<unknown> {
    try {
        return JSON.parse(await respuesta.text())
    } catch {
        return undefined
    }
}

async function aApiError(respuesta: Response): Promise<ApiError> {
    const analisis = ErrorResponseSchema.safeParse(await leerJson(respuesta))
    if (analisis.success) {
        return new ApiError(respuesta.status, analisis.data.message, analisis.data.details)
    }
    return new ApiError(respuesta.status, `Error HTTP ${respuesta.status}`, {}, true)
}

/** Único punto de salida a la red: Bearer en Authorization, errores → ApiError, respuestas validadas con zod. */
export async function solicitar<T>(ruta: string, opciones: OpcionesSolicitud<T>): Promise<T> {
    const { esquema, metodo = 'GET', cuerpo, parametros, signal } = opciones
    const token = config.obtenerToken()

    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'

    let respuesta: Response
    try {
        respuesta = await fetch(construirUrl(ruta, parametros), {
            method: metodo,
            headers,
            body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
            signal,
        })
    } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e
        throw new ApiError(0, 'No pudimos conectar con el servidor.', {}, true)
    }

    if (!respuesta.ok) {
        if (respuesta.status === 401 && token) config.alSesionExpirada()
        throw await aApiError(respuesta)
    }

    const analisis = esquema.safeParse(await leerJson(respuesta))
    if (!analisis.success) {
        throw new ApiError(500, 'Respuesta inesperada del servidor.', {}, true)
    }
    return analisis.data
}