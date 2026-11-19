import { z } from 'zod'

export const CLAVE_SESION = 'pulsepass.sesion'

const CredencialSchema = z.object({ token: z.string().min(1), expiraEn: z.number() })
export type Credencial = z.infer<typeof CredencialSchema>

let enMemoria: Credencial | null = null

export function obtenerTokenActual(): string | null {
    return enMemoria?.token ?? null
}

export function guardarCredencial(credencial: Credencial): void {
    enMemoria = credencial
    try {
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(credencial))
    } catch {
        // Sin sessionStorage disponible: la sesión vive solo en memoria.
    }
}

export function borrarCredencial(): void {
    enMemoria = null
    try {
        sessionStorage.removeItem(CLAVE_SESION)
    } catch {
        // Nada que limpiar.
    }
}

/** Lee y valida (zod) lo guardado; descarta lo corrupto o ya vencido. `ahora` se inyecta. */
export function restaurarCredencial(ahora: number): Credencial | null {
    let crudo: string | null = null
    try {
        crudo = sessionStorage.getItem(CLAVE_SESION)
    } catch {
        enMemoria = null
        return null
    }
    if (!crudo) {
        enMemoria = null
        return null
    }
    let analisis: ReturnType<typeof CredencialSchema.safeParse>
    try {
        analisis = CredencialSchema.safeParse(JSON.parse(crudo))
    } catch {
        borrarCredencial()
        return null
    }
    if (!analisis.success || analisis.data.expiraEn <= ahora) {
        borrarCredencial()
        return null
    }
    enMemoria = analisis.data
    return analisis.data
}