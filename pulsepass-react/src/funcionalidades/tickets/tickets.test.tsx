import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { rutas } from '../../Router'
import { andrea, errorApi, ticketAndrea } from '../../test/mocks/datos'
import { server } from '../../test/mocks/server'
import { renderizarRutas, sembrarSesion } from '../../test/Utils'
import type { TicketResponse, TicketStatus } from './tipos'

const usado: TicketResponse = {
    ...ticketAndrea,
    id: 101,
    ticketCode: 'TKT-5C90E2',
    status: 'USED',
    eventName: 'Noche de Jazz y Cultura',
}
const cancelado: TicketResponse = {
    ...ticketAndrea,
    id: 102,
    ticketCode: 'TKT-77AD13',
    status: 'CANCELLED',
    eventName: 'Stand-up Costeño',
}

async function abrirModalDeCompra(user: ReturnType<typeof renderizarRutas>['user'], tipo?: string) {
    const comprar = await screen.findByRole('button', { name: 'Comprar entrada' })
    await waitFor(() => expect(comprar).toBeEnabled())
    if (tipo) await user.click(screen.getByLabelText(tipo))
    await user.click(comprar)
    return screen.findByRole('dialog', { name: 'Confirmar compra' })
}

describe('compra', () => {
    it('TEST-FE-TKT-001 / AC-FE-010: compra válida → 201 y navega a la confirmación', async () => {
        sembrarSesion(['USER'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        const dialogo = await abrirModalDeCompra(user, 'VIP')
        await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))

        await waitFor(() =>
            expect(router.state.location.pathname).toBe('/compra/confirmacion/TKT-NEW001'),
        )
        expect(
            await screen.findByRole('heading', { name: '¡Compra realizada con éxito!' }),
        ).toBeInTheDocument()
    })

    it('TEST-FE-TKT-002: compra anónima → redirige a login con state.desde', async () => {
        const { user, router } = renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        await user.click(await screen.findByRole('link', { name: 'Inicia sesión para comprar' }))
        await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
        expect(router.state.location.state).toEqual({ desde: '/eventos/CMF-2026' })
    })

    it('TEST-FE-TKT-003 / AC-FE-011: 409 → mensaje del backend en el modal, sin navegar', async () => {
        server.use(
            http.post('*/api/tickets', () =>
                errorApi(409, 'Conflict', 'User does not meet the minimum age for this event'),
            ),
        )
        sembrarSesion(['USER'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        const dialogo = await abrirModalDeCompra(user)
        await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))

        expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
            'User does not meet the minimum age for this event',
        )
        expect(router.state.location.pathname).toBe('/eventos/CMF-2026')
    })

    it('TEST-FE-TKT-004: la compra envía el email de la sesión (sin campo editable)', async () => {
        let cuerpo: unknown
        server.use(
            http.post('*/api/tickets', async ({ request }) => {
                cuerpo = await request.json()
                return HttpResponse.json({ ...ticketAndrea, ticketCode: 'TKT-NEW001' }, { status: 201 })
            }),
        )
        sembrarSesion(['USER'])
        const { user } = renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        const dialogo = await abrirModalDeCompra(user, 'VIP')
        expect(within(dialogo).queryByRole('textbox')).not.toBeInTheDocument()
        expect(within(dialogo).getByText(andrea.email)).toBeInTheDocument()

        await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))
        await waitFor(() =>
            expect(cuerpo).toEqual({ userEmail: andrea.email, eventCode: 'CMF-2026', type: 'VIP' }),
        )
    })
})

describe('mis tickets', () => {
    it('TEST-FE-TKT-005: lista y filtra por estado', async () => {
        server.use(
            http.get('*/api/tickets/by-user', () => HttpResponse.json([ticketAndrea, usado, cancelado])),
        )
        sembrarSesion(['USER'])
        const { user } = renderizarRutas(rutas, { entradas: ['/mis-tickets'] })
        expect(await screen.findByText('TKT-8F2A1C')).toBeInTheDocument()
        expect(screen.getByText('TKT-5C90E2')).toBeInTheDocument()
        expect(screen.getByText('TKT-77AD13')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Usados' }))
        expect(screen.getByText('TKT-5C90E2')).toBeInTheDocument()
        expect(screen.queryByText('TKT-8F2A1C')).not.toBeInTheDocument()
        expect(screen.queryByText('TKT-77AD13')).not.toBeInTheDocument()
    })

    it('TEST-FE-TKT-006: sin tickets → estado vacío con enlace a la cartelera', async () => {
        server.use(http.get('*/api/tickets/by-user', () => HttpResponse.json([])))
        sembrarSesion(['USER'])
        renderizarRutas(rutas, { entradas: ['/mis-tickets'] })
        expect(await screen.findByText('Aún no tienes tickets')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/eventos')
    })

    it('TEST-FE-TKT-007 / AC-FE-012: cancelar un PAID → CANCELLED y lista actualizada', async () => {
        let estado: TicketStatus = 'PAID'
        server.use(
            http.get('*/api/tickets/by-user', () => HttpResponse.json([{ ...ticketAndrea, status: estado }])),
            http.patch('*/api/tickets/:code/cancel', () => {
                estado = 'CANCELLED'
                return HttpResponse.json({ ...ticketAndrea, status: estado })
            }),
        )
        sembrarSesion(['USER'])
        const { user } = renderizarRutas(rutas, { entradas: ['/mis-tickets'] })
        await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
        const dialogo = await screen.findByRole('dialog', { name: 'Cancelar ticket' })
        await user.click(within(dialogo).getByRole('button', { name: 'Cancelar ticket' }))

        expect(await screen.findByText('CANCELLED')).toBeInTheDocument()
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    })

    it('TEST-FE-TKT-008 / AC-FE-013: cancelar → 409 muestra el mensaje y mantiene el modal', async () => {
        server.use(
            http.patch('*/api/tickets/:code/cancel', () =>
                errorApi(409, 'Conflict', 'Ticket cannot be cancelled in its current state'),
            ),
        )
        sembrarSesion(['USER'])
        const { user } = renderizarRutas(rutas, { entradas: ['/mis-tickets'] })
        await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
        const dialogo = await screen.findByRole('dialog', { name: 'Cancelar ticket' })
        await user.click(within(dialogo).getByRole('button', { name: 'Cancelar ticket' }))

        expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
            'Ticket cannot be cancelled in its current state',
        )
        expect(screen.getByRole('dialog', { name: 'Cancelar ticket' })).toBeInTheDocument()
    })

    it('TEST-FE-TKT-010: el botón Cancelar se oculta si el estado no es PAID', async () => {
        server.use(
            http.get('*/api/tickets/by-user', () => HttpResponse.json([usado, cancelado])),
            http.get('*/api/tickets/:code', () => HttpResponse.json(usado)),
        )
        sembrarSesion(['USER'])
        const lista = renderizarRutas(rutas, { entradas: ['/mis-tickets'] })
        expect(await screen.findByText('TKT-5C90E2')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
        lista.unmount()

        sembrarSesion(['USER'])
        renderizarRutas(rutas, { entradas: ['/mis-tickets/TKT-5C90E2'] })
        expect(await screen.findByRole('heading', { name: 'Noche de Jazz y Cultura' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Cancelar ticket' })).not.toBeInTheDocument()
    })
})

describe('detalle de ticket', () => {
    it.each([403, 404])(
        'TEST-FE-TKT-009 / AC-FE-014: ticket ajeno (%i) → "Ticket no disponible" sin datos',
        async (estado) => {
            server.use(
                http.get('*/api/tickets/:code', () => errorApi(estado, 'Error', 'No disponible')),
            )
            sembrarSesion(['USER'])
            renderizarRutas(rutas, { entradas: ['/mis-tickets/TKT-AJENO'] })
            expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
            expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
        },
    )
})