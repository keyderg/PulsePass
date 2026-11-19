import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { LoginSchema } from '../../funcionalidades/auth/tipos'
import { CrearEventoSchema } from '../../funcionalidades/eventos/tipos'
import {
    PurchaseTicketRequestSchema,
    type TicketResponse,
} from '../../funcionalidades/tickets/tipos'
import { RegistroSchema } from '../../funcionalidades/usuarios/tipos'
import {
    andrea,
    artistas,
    CLAVE_ANDREA,
    errorApi,
    evento,
    PRECIOS,
    resumenEventos,
    sede,
    ticketAndrea,
    TOKEN_ANDREA,
} from './datos'

function protegido(resolver: HttpResponseResolver): HttpResponseResolver {
    return (info) =>
        info.request.headers.get('authorization')?.startsWith('Bearer ')
            ? resolver(info)
            : errorApi(401, 'Unauthorized', 'Authentication required')
}

const noExiste = (qué: string) => errorApi(404, 'Not Found', `${qué} not found`)

function detallesDe(issues: readonly { path: PropertyKey[]; message: string }[]) {
    const detalles: Record<string, string> = {}
    for (const i of issues) detalles[String(i.path[0])] = i.message
    return detalles
}

export const handlers = [
    // Autenticación (A1, A2)
    http.post('*/api/auth/login', async ({ request }) => {
        const cuerpo: unknown = await request.json()
        const r = LoginSchema.safeParse(cuerpo)
        if (!r.success) return errorApi(400, 'Bad Request', 'Validation failed', detallesDe(r.error.issues))
        if (r.data.identifier === 'andrea' && r.data.password === CLAVE_ANDREA) {
            return HttpResponse.json({ accessToken: TOKEN_ANDREA, tokenType: 'Bearer', expiresIn: 900 })
        }
        return errorApi(401, 'Unauthorized', 'Credenciales inválidas')
    }),
    http.get(
        '*/api/auth/me',
        protegido(() => HttpResponse.json({ id: andrea.id, username: andrea.username, roles: ['USER'] })),
    ),

    // Sedes (1, 2)
    http.get('*/api/venues/active', () => HttpResponse.json([sede])),
    http.get('*/api/venues/:code', ({ params }) =>
        params.code === sede.code ? HttpResponse.json(sede) : noExiste('Venue'),
    ),

    // Eventos (3–8). Las rutas fijas van antes que las parametrizadas.
    http.get('*/api/events/published', () => HttpResponse.json(resumenEventos)),
    http.get('*/api/events/by-artist', ({ request }) => {
        const nombre = new URL(request.url).searchParams.get('stageName')
        const hay = evento.artists.some((a) => a.stageName === nombre)
        return HttpResponse.json(hay ? resumenEventos : [])
    }),
    http.post(
        '*/api/events',
        protegido(async ({ request }) => {
            const r = CrearEventoSchema.safeParse(await request.json())
            if (!r.success) return errorApi(400, 'Bad Request', 'Validation failed', detallesDe(r.error.issues))
            if (r.data.eventCode === evento.eventCode) {
                return errorApi(409, 'Conflict', 'Event code already exists')
            }
            return HttpResponse.json(
                { ...evento, ...r.data, id: 2, status: 'DRAFT', venueName: sede.name, artists: [] },
                { status: 201 },
            )
        }),
    ),
    http.get('*/api/events/:code/tickets/paid', protegido(({ params }) =>
        params.code === evento.eventCode ? HttpResponse.json([ticketAndrea]) : noExiste('Event'),
    )),
    http.patch(
        '*/api/events/:code/publish',
        protegido(({ params }) =>
            params.code === evento.eventCode
                ? HttpResponse.json({ ...evento, status: 'PUBLISHED' })
                : noExiste('Event'),
        ),
    ),
    http.post(
        '*/api/events/:code/artists/:artistId',
        protegido(({ params }) => {
            const artista = artistas.find((a) => a.id === Number(params.artistId))
            if (params.code !== evento.eventCode) return noExiste('Event')
            if (!artista) return noExiste('Artist')
            return HttpResponse.json({ ...evento, artists: [...evento.artists, artista] })
        }),
    ),
    http.get('*/api/events/:code', ({ params }) =>
        params.code === evento.eventCode ? HttpResponse.json(evento) : noExiste('Event'),
    ),

    // Artistas (9–11)
    http.get('*/api/artists/active', () => HttpResponse.json(artistas)),
    http.get('*/api/artists/by-stage-name', ({ request }) => {
        const nombre = new URL(request.url).searchParams.get('stageName')
        const a = artistas.find((x) => x.stageName === nombre)
        return a ? HttpResponse.json(a) : noExiste('Artist')
    }),
    http.get('*/api/artists/:id', ({ params }) => {
        const a = artistas.find((x) => x.id === Number(params.id))
        return a ? HttpResponse.json(a) : noExiste('Artist')
    }),

    // Usuarios (12–14)
    http.post('*/api/users', async ({ request }) => {
        const r = RegistroSchema.safeParse(await request.json())
        if (!r.success) return errorApi(400, 'Bad Request', 'Validation failed', detallesDe(r.error.issues))
        if (r.data.email === andrea.email) return errorApi(409, 'Conflict', 'Email already registered')
        const { password: _omitida, ...publico } = r.data
        return HttpResponse.json({ ...publico, id: 11, active: true }, { status: 201 })
    }),
    http.get(
        '*/api/users/by-email',
        protegido(({ request }) =>
            new URL(request.url).searchParams.get('email') === andrea.email
                ? HttpResponse.json(andrea)
                : noExiste('User'),
        ),
    ),
    http.get(
        '*/api/users/by-username',
        protegido(({ request }) =>
            new URL(request.url).searchParams.get('username') === andrea.username
                ? HttpResponse.json(andrea)
                : noExiste('User'),
        ),
    ),

    // Tickets (15–20)
    http.post(
        '*/api/tickets',
        protegido(async ({ request }) => {
            const r = PurchaseTicketRequestSchema.safeParse(await request.json())
            if (!r.success) return errorApi(400, 'Bad Request', 'Validation failed', detallesDe(r.error.issues))
            if (r.data.eventCode !== evento.eventCode) return noExiste('Event')
            if (r.data.userEmail === 'laura@pulsepass.test') {
                return errorApi(409, 'Conflict', 'User does not meet the minimum age for this event')
            }
            const nuevo: TicketResponse = {
                ...ticketAndrea,
                id: 101,
                ticketCode: 'TKT-NEW001',
                type: r.data.type,
                price: PRECIOS[r.data.type],
                userEmail: r.data.userEmail,
            }
            return HttpResponse.json(nuevo, { status: 201 })
        }),
    ),
    http.get(
        '*/api/tickets/by-user',
        protegido(({ request }) =>
            HttpResponse.json(
                new URL(request.url).searchParams.get('email') === andrea.email ? [ticketAndrea] : [],
            ),
        ),
    ),
    http.patch(
        '*/api/tickets/:code/cancel',
        protegido(({ params }) =>
            params.code === ticketAndrea.ticketCode
                ? HttpResponse.json({ ...ticketAndrea, status: 'CANCELLED' })
                : noExiste('Ticket'),
        ),
    ),
    http.patch(
        '*/api/tickets/:code/use',
        protegido(({ params }) =>
            params.code === ticketAndrea.ticketCode
                ? HttpResponse.json({ ...ticketAndrea, status: 'USED' })
                : noExiste('Ticket'),
        ),
    ),
    http.get(
        '*/api/tickets/:code',
        protegido(({ params }) =>
            params.code === ticketAndrea.ticketCode ? HttpResponse.json(ticketAndrea) : noExiste('Ticket'),
        ),
    ),
]