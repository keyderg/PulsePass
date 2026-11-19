import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { rutas } from '../../Router'
import { errorApi, ticketAndrea } from '../../test/mocks/datos'
import { server } from '../../test/mocks/server'
import { renderizarRutas, sembrarSesion } from '../../test/Utils'

async function buscar(user: ReturnType<typeof renderizarRutas>['user'], codigo: string) {
    const campo = await screen.findByLabelText('Código de ticket')
    await user.type(campo, codigo)
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
}

describe('validación de ingreso', () => {
    it('TEST-FE-STF-001: buscar y marcar como usado → éxito', async () => {
        sembrarSesion(['STAFF'])
        const { user } = renderizarRutas(rutas, { entradas: ['/staff/validacion'] })
        await buscar(user, 'TKT-8F2A1C')
        expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
        expect(await screen.findByText(/Titular: Andrea Pérez/)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Marcar como usado' }))
        expect(await screen.findByText('Ingreso registrado.')).toBeInTheDocument()
        expect(screen.getByText('USED')).toBeInTheDocument()
        expect(screen.getByLabelText('Código de ticket')).toHaveValue('')
    })

    it('TEST-FE-STF-002 / AC-FE-016: la segunda vez muestra el 409', async () => {
        let llamadas = 0
        server.use(
            http.patch('*/api/tickets/:code/use', () => {
                llamadas += 1
                return llamadas === 1
                    ? HttpResponse.json({ ...ticketAndrea, status: 'USED' })
                    : errorApi(409, 'Conflict', 'Ticket already used')
            }),
        )
        sembrarSesion(['STAFF'])
        const { user } = renderizarRutas(rutas, { entradas: ['/staff/validacion'] })
        await buscar(user, 'TKT-8F2A1C')
        await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
        expect(await screen.findByText('Ingreso registrado.')).toBeInTheDocument()

        await buscar(user, 'TKT-8F2A1C')
        await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
        expect(await screen.findByText('Ticket already used')).toBeInTheDocument()
    })

    it('TEST-FE-STF-003: ticket inexistente → 404 visible', async () => {
        sembrarSesion(['STAFF'])
        const { user } = renderizarRutas(rutas, { entradas: ['/staff/validacion'] })
        await buscar(user, 'TKT-NOPE')
        expect(await screen.findByText('Ticket no encontrado')).toBeInTheDocument()
    })
})

describe('tickets pagados por evento', () => {
    it('TEST-FE-STF-004: la tabla muestra una fila por ticket', async () => {
        server.use(
            http.get('*/api/events/:code/tickets/paid', () =>
                HttpResponse.json([
                    ticketAndrea,
                    { ...ticketAndrea, id: 103, ticketCode: 'TKT-91B07D', type: 'GENERAL', price: 120000, userEmail: 'carlos@pulsepass.test' },
                ]),
            ),
        )
        sembrarSesion(['STAFF'])
        renderizarRutas(rutas, { entradas: ['/staff/eventos/CMF-2026/tickets'] })

        const tabla = await screen.findByRole('table', { name: 'Tickets pagados del evento' })
        expect(within(tabla).getAllByRole('row')).toHaveLength(3) // encabezado + 2 filas
        expect(within(tabla).getByText('TKT-8F2A1C')).toBeInTheDocument()
        expect(within(tabla).getByText('TKT-91B07D')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByText('Total: 2')).toBeInTheDocument())
    })
    it('sin código: muestra el selector y no consulta la API', async () => {
        let llamadas = 0
        server.use(
            http.get('*/api/events/:code/tickets/paid', () => {
                llamadas += 1
                return HttpResponse.json([])
            }),
        )
        sembrarSesion(['STAFF'])
        renderizarRutas(rutas, { entradas: ['/staff/eventos/tickets'] })

        expect(
            await screen.findByText('Ingresa el código de un evento para ver sus tickets pagados'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Evento')).toBeInTheDocument()
        expect(llamadas).toBe(0)
    })

    it('navbar: "Tickets pagados" lleva a la ruta sin código y queda activo con código', async () => {
        server.use(http.get('*/api/events/:code/tickets/paid', () => HttpResponse.json([])))
        sembrarSesion(['STAFF'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/staff/validacion'] })

        const nav = await screen.findByRole('navigation', { name: 'Principal' })
        await user.click(within(nav).getByRole('link', { name: 'Tickets pagados' }))
        await waitFor(() => expect(router.state.location.pathname).toBe('/staff/eventos/tickets'))

        await user.type(await screen.findByLabelText('Evento'), 'CMF-2026')
        await user.click(screen.getByRole('button', { name: 'Ir' }))
        await waitFor(() =>
            expect(router.state.location.pathname).toBe('/staff/eventos/CMF-2026/tickets'),
        )
        expect(within(nav).getByRole('link', { name: 'Tickets pagados' })).toHaveAttribute(
            'aria-current',
            'page',
        )
    })

    it('navbar: USER no ve "Tickets pagados"', async () => {
        sembrarSesion(['USER'])
        renderizarRutas(rutas, { entradas: ['/'] })
        const nav = await screen.findByRole('navigation', { name: 'Principal' })
        // esperar a que la sesión cargue (un USER sí ve "Mis tickets")
        expect(await within(nav).findByRole('link', { name: 'Mis tickets' })).toBeInTheDocument()
        expect(within(nav).queryByRole('link', { name: 'Tickets pagados' })).not.toBeInTheDocument()
    })

    it('navbar: ADMIN ve "Tickets pagados"', async () => {
        sembrarSesion(['ADMIN'])
        renderizarRutas(rutas, { entradas: ['/'] })
        const nav = await screen.findByRole('navigation', { name: 'Principal' })
        expect(await within(nav).findByRole('link', { name: 'Tickets pagados' })).toBeInTheDocument()
    })
})

describe('selector de evento (RHF + zod)', () => {
    it('código vacío → error de formulario y sin navegar', async () => {
        sembrarSesion(['STAFF'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/staff/eventos/tickets'] })
        await user.click(await screen.findByRole('button', { name: 'Ir' }))
        expect(await screen.findByText('Ingresa el código del evento')).toBeInTheDocument()
        expect(router.state.location.pathname).toBe('/staff/eventos/tickets')
    })
})
