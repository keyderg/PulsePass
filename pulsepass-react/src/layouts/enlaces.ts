import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'

export interface EnlaceNav {
    etiqueta: string
    a: string
    /** Si se define, decide cuándo el enlace se resalta (por defecto: la ruta o sus subrutas). */
    activa?: (pathname: string) => boolean
}

/** "Tickets pagados" apunta a la ruta sin código, pero también está activo con /staff/eventos/:code/tickets. */
const esTicketsPagados = (pathname: string) => /^\/staff\/eventos(\/[^/]+)?\/tickets\/?$/.test(pathname)

export const ENLACES_PUBLICOS: EnlaceNav[] = [
    { etiqueta: 'Eventos', a: RUTAS.eventos },
    { etiqueta: 'Artistas', a: RUTAS.artistas },
    { etiqueta: 'Sedes', a: RUTAS.sedes },
]

/** Tabla 8.4. */
export function enlacesDeRol(roles: readonly Rol[]): EnlaceNav[] {
    const enlaces: EnlaceNav[] = []
    if (roles.includes('USER')) enlaces.push({ etiqueta: 'Mis tickets', a: RUTAS.misTickets })
    if (roles.includes('STAFF') || roles.includes('ADMIN')) {
        enlaces.push({ etiqueta: 'Validar ingreso', a: RUTAS.validacion })
        enlaces.push({
            etiqueta: 'Tickets pagados',
            a: RUTAS.ticketsPagados(),
            activa: esTicketsPagados,
        })
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