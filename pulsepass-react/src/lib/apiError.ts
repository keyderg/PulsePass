import { z } from 'zod'

/** Contrato uniforme de errores de la API (Fase 3). */
export const ErrorResponseSchema = z.object({
    timestamp: z.string(),
    status: z.number(),
    error: z.string(),
    message: z.string(),
    details: z
        .record(z.string(), z.string())
        .nullish()
        .transform((d) => d ?? {}),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export class ApiError extends Error {
    readonly status: number
    readonly details: Record<string, string>
    /** true cuando el cuerpo del error no cumplió ErrorResponse (o hubo error de red). */
    readonly generico: boolean

    constructor(
        status: number,
        message: string,
        details: Record<string, string> = {},
        generico = false,
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.details = details
        this.generico = generico
    }

    /** status 0 = el fetch falló (sin conexión / API caída). */
    get esRed(): boolean {
        return this.status === 0
    }

}

export function tieneEstado(error: unknown, ...estados: number[]): boolean {
    return error instanceof ApiError && estados.includes(error.status)
}