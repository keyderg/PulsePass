import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './apiError'
import { mensajeDeError, type ContextoError } from './mensajesError'

/**
 * 400 con details → cada clave se asigna al campo homónimo (setError).
 * Devuelve el texto del aviso general del formulario, o null si todo quedó en campos.
 */
export function aplicarErroresServidor<T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
    campos: readonly Path<T>[],
    contexto: ContextoError = {},
): string | null {
    if (!(error instanceof ApiError) || error.status !== 400) {
        return mensajeDeError(error, contexto)
    }
    const entradas = Object.entries(error.details)
    if (entradas.length === 0) return mensajeDeError(error, contexto)

    const generales: string[] = []
    for (const [clave, mensaje] of entradas) {
        const campo = campos.find((c) => c === clave)
        if (campo) setError(campo, { type: 'server', message: mensaje })
        else generales.push(`${clave}: ${mensaje}`)
    }
    return generales.length > 0 ? generales.join(' · ') : null
}