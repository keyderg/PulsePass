/** Enlaces absolutos (para <Link>, navigate). */
export const RUTAS = {
    inicio: '/',
    eventos: '/eventos',
    evento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
    artistas: '/artistas',
    artista: (id: number | string) => `/artistas/${id}`,
    sedes: '/sedes',
    sede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
    login: '/login',
    registro: '/registro',
    cuenta: '/cuenta',
    misTickets: '/mis-tickets',
    ticket: (ticketCode: string) => `/mis-tickets/${encodeURIComponent(ticketCode)}`,
    confirmacionCompra: (ticketCode: string) =>
        `/compra/confirmacion/${encodeURIComponent(ticketCode)}`,
    validacion: '/staff/validacion',
    ticketsPagados: (eventCode?: string) =>
        eventCode
            ? `/staff/eventos/${encodeURIComponent(eventCode)}/tickets`
            : '/staff/eventos/tickets',
    adminEventos: '/admin/eventos',
    adminNuevoEvento: '/admin/eventos/nuevo',
    adminEvento: (eventCode: string) => `/admin/eventos/${encodeURIComponent(eventCode)}`,
    sinPermisos: '/403',
} as const

/** Patrones relativos para declarar rutas en router.tsx. */
export const PATRONES = {
    eventos: 'eventos',
    evento: 'eventos/:eventCode?',
    artistas: 'artistas',
    artista: 'artistas/:id',
    sedes: 'sedes',
    sede: 'sedes/:code',
    login: 'login',
    registro: 'registro',
    cuenta: 'cuenta',
    misTickets: 'mis-tickets',
    ticket: 'mis-tickets/:ticketCode',
    confirmacionCompra: 'compra/confirmacion/:ticketCode',
    validacion: 'staff/validacion',
    ticketsPagados: 'staff/eventos/:eventCode?/tickets',
    adminEventos: 'admin/eventos',
    adminNuevoEvento: 'admin/eventos/nuevo',
    adminEvento: 'admin/eventos/:eventCode',
    sinPermisos: '403',
} as const