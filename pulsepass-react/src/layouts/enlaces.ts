import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'

export interface EnlaceNav {
    etiqueta: string
    a: string
}

export const ENLACES_PUBLICOS: EnlaceNav[] = [
    { etiqueta: 'Eventos', a: RUTAS.eventos },
    { etiqueta: 'Artistas', a: RUTAS.artistas },
    { etiqueta: 'Sedes', a: RUTAS.sedes },
]

/** Tabla 8.4. "Tickets pagados" se añade aquí cuando la Parte 6 defina cómo elegir el evento. */
export function enlacesDeRol(roles: readonly Rol[]): EnlaceNav[] {
    const enlaces: EnlaceNav[] = []
    if (roles.includes('USER')) enlaces.push({ etiqueta: 'Mis tickets', a: RUTAS.misTickets })
    if (roles.includes('STAFF') || roles.includes('ADMIN')) {
        enlaces.push({ etiqueta: 'Validar ingreso', a: RUTAS.validacion })
    }
    if (roles.includes('ADMIN')) {
        enlaces.push({ etiqueta: 'Administrar eventos', a: RUTAS.adminEventos })
    }
    return enlaces
}

export function claseEnlaceNav({ isActive }: { isActive: boolean }): string {
    return [
        'inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-marca-600',
        isActive
            ? 'bg-marca-50 text-marca-700 dark:bg-indigo-950 dark:text-indigo-300'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
    ].join(' ')
}