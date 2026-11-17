import { z } from 'zod'

/** El `location.state` también es un dato externo: se valida. `desde` solo admite rutas internas. */
const EstadoNavegacionSchema = z.object({
    desde: z
        .string()
        .startsWith('/')
        .refine((s) => !s.startsWith('//'))
        .optional(),
    motivo: z.literal('expirada').optional(),
    registrado: z.boolean().optional(),
})
export type EstadoNavegacion = z.infer<typeof EstadoNavegacionSchema>

export function leerEstadoNavegacion(state: unknown): EstadoNavegacion {
    const r = EstadoNavegacionSchema.safeParse(state)
    return r.success ? r.data : {}
}

/** "12" → 12; "abc", "", "1.5", "-3" → null (la página responde 404 sin llamar a la API). */
export function leerIdNumerico(texto: string | undefined): number | null {
    if (!texto || !/^\d+$/.test(texto)) return null
    const n = Number(texto)
    return Number.isSafeInteger(n) && n > 0 ? n : null
}