import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, type InitialEntry, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from '../funcionalidades/auth/AuthContext'
import { CLAVE_SESION } from '../funcionalidades/auth/almacen'
import type { Rol } from '../funcionalidades/auth/tipos'
import { andrea } from './mocks/datos'
import { server } from './mocks/server'

export const AHORA_FIJO = new Date('2026-11-16T12:00:00').getTime()
export const VIGENCIA_MS = 15 * 60 * 1000

/** Deja una sesión restaurable en sessionStorage y hace que /auth/me responda con esos roles. */
export function sembrarSesion(roles: Rol[], opciones: { expiraEn?: number } = {}) {
    sessionStorage.setItem(
        CLAVE_SESION,
        JSON.stringify({ token: 'token-test', expiraEn: opciones.expiraEn ?? AHORA_FIJO + VIGENCIA_MS }),
    )
    server.use(
        http.get('*/api/auth/me', () =>
            HttpResponse.json({ id: andrea.id, username: andrea.username, roles }),
        ),
        http.get('*/api/users/by-username', () => HttpResponse.json(andrea)),
    )
}

/** Cuenta las peticiones que salen a la red (para verificar "0 peticiones"). */
export function contarPeticiones() {
    const urls: string[] = []
    const alIniciar = ({ request }: { request: Request }) => {
        urls.push(request.url)
    }
    server.events.on('request:start', alIniciar)
    return { urls, detener: () => server.events.removeListener('request:start', alIniciar) }
}

interface Opciones {
    entradas?: InitialEntry[]
    ahora?: () => number
}

export function renderizarRutas(rutas: RouteObject[], opciones: Opciones = {}) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const router = createMemoryRouter(rutas, { initialEntries: opciones.entradas ?? ['/'] })
    const user = userEvent.setup()
    const resultado = render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider ahora={opciones.ahora ?? (() => AHORA_FIJO)}>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>,
    )
    return { ...resultado, router, queryClient, user }
}