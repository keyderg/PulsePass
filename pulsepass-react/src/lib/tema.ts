import { z } from 'zod'

export const TemaSchema = z.enum(['claro', 'oscuro'])
export type Tema = z.infer<typeof TemaSchema>

/** Clave en sessionStorage (misma de index.html). Solo guarda la preferencia visual, nunca datos de sesión. */
export const CLAVE_TEMA = 'pulsepass-tema'

/** Tema aplicado ahora mismo (la clase `dark` en <html> es la fuente de verdad). */
export function temaActual(): Tema {
    return document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
}

export function aplicarTema(tema: Tema): void {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    try {
        sessionStorage.setItem(CLAVE_TEMA, tema)
    } catch {
        // Sin almacenamiento: el cambio vale solo mientras dure la página.
    }
}

/** Preferencia guardada (validada con zod) o null. */
export function leerTemaGuardado(): Tema | null {
    try {
        const r = TemaSchema.safeParse(sessionStorage.getItem(CLAVE_TEMA))
        return r.success ? r.data : null
    } catch {
        return null
    }
}
