import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { rutas } from '../../Router'
import { CLAVE_ANDREA, errorApi, evento } from '../../test/mocks/datos'
import { server } from '../../test/mocks/server'
import { renderizarRutas, sembrarSesion } from '../../test/Utils'

describe('cartelera', () => {
    it('TEST-FE-EVT-001 / AC-FE-001: anónimo ve los eventos publicados', async () => {
        renderizarRutas(rutas, { entradas: ['/eventos'] })
        const tarjeta = await screen.findByRole('link', { name: /Caribbean Music Fest 2026/ })
        expect(tarjeta).toHaveAttribute('href', '/eventos/CMF-2026')
        expect(screen.getByText('1 evento')).toBeInTheDocument()
        expect(await within(tarjeta).findByText('MUSIC')).toBeInTheDocument()
        expect(await within(tarjeta).findByText('Santa Marta')).toBeInTheDocument()
    })

    it('TEST-FE-EVT-002: lista vacía → estado vacío', async () => {
        server.use(http.get('*/api/events/published', () => HttpResponse.json([])))
        renderizarRutas(rutas, { entradas: ['/eventos'] })
        expect(await screen.findByText('Aún no hay eventos publicados')).toBeInTheDocument()
    })

    it('TEST-FE-EVT-003: filtro por texto y categoría actualiza la URL', async () => {
        const { user, router } = renderizarRutas(rutas, { entradas: ['/eventos'] })
        await screen.findByRole('link', { name: /Caribbean Music Fest 2026/ })

        await user.type(screen.getByLabelText('Buscar por nombre'), 'caribbean')
        await waitFor(() => expect(router.state.location.search).toBe('?q=caribbean'))

        await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
        await waitFor(() => expect(router.state.location.search).toContain('categoria=MUSIC'))
        expect(screen.getByRole('link', { name: /Caribbean Music Fest 2026/ })).toBeInTheDocument()

        await user.clear(screen.getByLabelText('Buscar por nombre'))
        await user.type(screen.getByLabelText('Buscar por nombre'), 'zzz')
        expect(await screen.findByText('Sin resultados para tu búsqueda')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Limpiar' }))
        await waitFor(() => expect(router.state.location.search).toBe(''))
        expect(await screen.findByRole('link', { name: /Caribbean Music Fest 2026/ })).toBeInTheDocument()
    })

    it('el filtro de la URL sobrevive a la recarga (?q=)', async () => {
        renderizarRutas(rutas, { entradas: ['/eventos?q=zzz'] })
        expect(await screen.findByText('Sin resultados para tu búsqueda')).toBeInTheDocument()
        expect(screen.getByLabelText('Buscar por nombre')).toHaveValue('zzz')
    })

    it('?artista= usa by-artist', async () => {
        renderizarRutas(rutas, { entradas: ['/eventos?artista=Solar%20Beat'] })
        expect(await screen.findByRole('link', { name: /Caribbean Music Fest 2026/ })).toBeInTheDocument()
    })

    it('op. 10: ?artista= resuelve el artista por nombre y enlaza a su detalle', async () => {
        renderizarRutas(rutas, { entradas: ['/eventos?artista=Solar%20Beat'] })
        const enlace = await screen.findByRole('link', { name: 'Solar Beat' })
        expect(enlace).toHaveAttribute('href', '/artistas/1')
    })

    it('op. 10: artista inexistente (404) → sin aviso de artista, la página no se rompe', async () => {
        renderizarRutas(rutas, { entradas: ['/eventos?artista=Nadie'] })
        expect(await screen.findByRole('heading', { name: 'Cartelera' })).toBeInTheDocument()
        await waitFor(() => expect(screen.queryByText(/Mostrando eventos de/)).not.toBeInTheDocument())
    })
})

describe('detalle de evento', () => {
    it('TEST-FE-EVT-004 / AC-FE-002: muestra evento, artistas y sede', async () => {
        renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        expect(
            await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Edad mínima: 18')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Solar Beat' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Neon Waves' })).toBeInTheDocument()
        expect(await screen.findByText('Santa Marta · Capacidad 3')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Marina Convention Center/ })).toHaveAttribute(
            'href',
            '/sedes/VEN-SMR-01',
        )
    })

    it('TEST-FE-EVT-005 / AC-FE-003: 404 → "Evento no disponible" sin datos', async () => {
        server.use(
            http.get('*/api/events/:code', () => errorApi(404, 'Not Found', 'Event not found')),
        )
        renderizarRutas(rutas, { entradas: ['/eventos/BORRADOR-1'] })
        expect(await screen.findByRole('heading', { name: 'Evento no disponible' })).toBeInTheDocument()
        expect(screen.queryByText('Entradas')).not.toBeInTheDocument()
    })

    it('TEST-FE-EVT-006: SOLD_OUT → compra deshabilitada con motivo', async () => {
        server.use(
            http.get('*/api/events/:code', () => HttpResponse.json({ ...evento, status: 'SOLD_OUT' })),
        )
        sembrarSesion(['USER'])
        renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        const boton = await screen.findByRole('button', { name: 'Comprar entrada' })
        expect(boton).toBeDisabled()
        expect(screen.getByText('Entradas agotadas.')).toBeInTheDocument()
    })

    it('USER ve los 4 tipos de entrada y puede comprar un evento PUBLISHED', async () => {
        sembrarSesion(['USER'])
        const { user } = renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        const boton = await screen.findByRole('button', { name: 'Comprar entrada' })
        await waitFor(() => expect(boton).toBeEnabled())
        expect(screen.getByRole('radio', { name: 'GENERAL' })).toBeChecked()
        await user.click(screen.getByRole('radio', { name: 'VIP' }))
        expect(screen.getByRole('radio', { name: 'VIP' })).toBeChecked()
        expect(screen.getByText('El precio lo define el sistema al confirmar.')).toBeInTheDocument()
    })

    it('STAFF no ve el panel de compra', async () => {
        sembrarSesion(['STAFF'])
        renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
        await screen.findByRole('button', { name: 'Andrea' })
        expect(screen.queryByRole('button', { name: 'Comprar entrada' })).not.toBeInTheDocument()
        expect(screen.queryByRole('radio', { name: 'VIP' })).not.toBeInTheDocument()
    })

    it('AC-FE-004: anónimo → "Inicia sesión para comprar" → login → vuelve al evento', async () => {
        const { user, router } = renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        await user.click(await screen.findByRole('link', { name: 'Inicia sesión para comprar' }))

        await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
        await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
        await user.type(screen.getByLabelText('Contraseña'), CLAVE_ANDREA)
        await user.click(screen.getByRole('button', { name: 'Ingresar' }))

        await waitFor(() => expect(router.state.location.pathname).toBe('/eventos/CMF-2026'))
        expect(await screen.findByRole('button', { name: 'Comprar entrada' })).toBeInTheDocument()
    })
})